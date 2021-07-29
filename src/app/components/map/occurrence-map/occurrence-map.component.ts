import {
  Component,
  OnInit,
  AfterViewInit,
  Output,
  ViewChild,
  EventEmitter,
  Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import {Vector} from 'ol/source';
import {bbox} from 'ol/loadingstrategy';
import { fromLonLat } from 'ol/proj';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { GeoJSON } from 'ol/format';
import { OSM, Vector as VectorSource } from 'ol/source';
import {Icon, Style} from 'ol/style';
// import Select from 'ol/interaction/Select';
import { DragBox, Select } from 'ol/interaction';
import { click, pointerMove, altKeyOnly, platformModifierKeyOnly} from 'ol/events/condition';
import TileWMS from 'ol/source/TileWMS';
import LayerSwitcher from 'ol-layerswitcher/src/ol-layerswitcher';
import {
  MatPaginator,
  MatSort,
  MatDialogRef,
  MatTableDataSource,
  MatDialogConfig,
  MatSnackBar,
  MatDialog } from '@angular/material';

// import { LayerSwitcher } from 'ol/control';
import {OccurrenceFilters}
  from '../../../model/occurrence/occurrence-filters.model';
import { Occurrence }
  from '../../../model/occurrence/occurrence.model';
import { OccurrencesDataSource }
  from '../../../services/occurrence/occurrences.datasource';
import { ImportDialogComponent }
  from '../../../components/occurrence/import-dialog/import-dialog.component';
import { SsoService }
  from '../../../services/commons/sso.service';
import { ConfirmDialogComponent }
  from '../../../components/occurrence/confirm-dialog/confirm-dialog.component';
import { DeviceDetectionService }
  from '../../../services/commons/device-detection.service';
import {
    BinaryDownloadService
} from '../../../services/commons/binary-download.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { TokenService } from '../../../services/commons/token.service';
import {
    NavigationService
} from '../../../services/commons/navigation.service';
import { BaseComponent } from '../../generic/base-component/base.component';

// @refactor This is the typical OL js mess. Hints too tame it a bit:
//          1/ use the ViewChild decorator to reference the map div and use that reference all along.
//          2/ Delegate layer generation + point styles to a helper/utils service + whatever.
@Component({
  selector: 'app-occurrence-map',
  templateUrl: './occurrence-map.component.html',
  styleUrls: ['./occurrence-map.component.css']
})
export class OccurrenceMapComponent extends BaseComponent implements AfterViewInit {

  private _occFilters: OccurrenceFilters;
  // The selected features (GeoJSON encoded occurrences):
  selected: any;
  selectedCount: number;

  private celGeoJsonServiceBaseUrl = environment.api.baseUrl + '/occurrences.geojson';
  private mapBgTileUrl = environment.mapBgTile.url;

  private importDialogRef: MatDialogRef<ImportDialogComponent>;

  private source: OlXYZ;
  private view: OlView;
  private occVectorSource: VectorSource;
  private map: OlMap;
  private layer: OlTileLayer;
  private occLayer: VectorLayer;
  private select: Select;

  private celGeoJsonServiceFilteredUrl;
  private googleHybridLayer;
  private centerX;

  private token: string;
  private _confirmDeletionMsg = 'Supprimer la/les observation(s) ?';
  @Output() showFilterEvent = new EventEmitter();
  @ViewChild('drawer') detailDrawer: any;
  @ViewChild('odl') occurrenceDetail: any;

  constructor(
    private dataSource:             OccurrencesDataSource,
    private dialog:                 MatDialog,
    private ssoService:             SsoService,
    private confirmDialog:          MatDialog,
    protected _deviceDetectionService: DeviceDetectionService,
    private dldService:             BinaryDownloadService,
        protected _navigationService: NavigationService,
    protected _tokenService: TokenService,
    protected _profileService: ProfileService,

    public snackBar:                MatSnackBar ) {

      super(
        _tokenService,
        _navigationService,
        _profileService,
        _deviceDetectionService);

    this.token = this.ssoService.getToken();




  }

  @Input() set occFilters(newOccFilters: OccurrenceFilters) {
    if (  newOccFilters != null ) {
      this._occFilters = newOccFilters;
      this.redrawMap();
    }
  }

  setSelected(features) {
    this.selected = features;
    this.selectedCount = features.getLength();
    if ( features.getArray().length > 0 ) {
      this.toggleDetailSlideNav();
    }
    this.occurrenceDetail.updateFeatures(this.selected);

}


  showFilters() {
     this.showFilterEvent.emit();
  }


  doExport() {
    if ( ! this._occFilters ) {
      this._occFilters = new OccurrenceFilters();
    }
    this._occFilters.ids = this.getSelectedIds();
    this.dataSource.export(this._occFilters).subscribe(data => {
      this.dldService.downloadBinary(data, 'text/csv', 'cel-export-');
    });
  }

  getSelectedCount() {
    return this.selectedCount;
  }

  redrawMap() {
    let geoJsonUrl = this.celGeoJsonServiceBaseUrl;
    this.select.getFeatures().clear();
    if (this._occFilters != null && this._occFilters != undefined) {
      geoJsonUrl += ('?' + this._occFilters.toUrlParameters());
    }
    // If we only do a setSource with the new updated source, filtered out
    // occurrences are still selectable.
    // See http://taiga.tela-botanica.net/project/mathias-carnet-en-ligne/issue/417
    // Thus we do all the source clearing + removing layer from map +
    // recreating layer with new filtered source + adding layer to the map:
    const vectorSource = this.createOccurrenceVectorSource(geoJsonUrl);
    this.map.removeLayer(this.occLayer);
    this.occLayer = null;
    this.occVectorSource.clear();
    this.occVectorSource = vectorSource;
    this.occLayer = new VectorLayer({
      source: this.occVectorSource,
      style: this.createOccurrenceLayerStyle()

    });
    this.map.addLayer(this.occLayer);

  }

  private createOlLayer() {
    return new OlTileLayer({
      source: new OlXYZ({
        title: 'OSM',
        attributions:  'Carte : <a href="openstreetmap.org/copyright" target="_blank">© les contributeurs d’OpenStreetMap</a> - Tuiles : <a href="swww.openstreetmap.fr" target="_blank">OsmFr</a>',
        // type: 'base',
        visible: true,
        url: this.mapBgTileUrl})
    });
  }


  private createOccurrenceVectorSource(geoJsonUrl) {
    const token =  this.token;
    const vectorSource = new VectorSource({
    format: new GeoJSON(),
    attributions:  '- Observations du réseau : <a href="tela-botanica.org" target="_blank">Tela Botanica</a',
    visible: true,
    loader: function(extent, resolution, projection) {
       const proj = projection.getCode();
       const xhr = new XMLHttpRequest();
       xhr.open('GET', geoJsonUrl);
       xhr.setRequestHeader('Authorization', token);
       const onError = function() {
         vectorSource.removeLoadedExtent(extent);
       };
       xhr.onerror = onError;
       xhr.onload = function() {
         if (xhr.status == 200) {
           vectorSource.addFeatures(
               vectorSource.getFormat().readFeatures(
                 xhr.responseText,
                 {
                   dataProjection: 'EPSG:4326',
                   featureProjection: 'EPSG:3857'
                 }
               )
           );
         } else {
           onError();
         }
       };
       xhr.send();
     }
   });
    return vectorSource;
  }

  private createOccurrenceLayerStyle() {
    return new Style({
        image: new Icon(({
          anchor: [0.5, 0],
          anchorOrigin: 'bottom-left',
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'assets/img/map/marker.png'
        }))});

  }

  private createSelectedOccurrenceLayerStyle() {
    return new Style({
        image: new Icon(({
          anchor: [0.5, 0],
          anchorOrigin: 'bottom-left',
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'assets/img/map/marker-selected.png'
        }))});

  }

  private createOccurrenceLayer() {
    const vectorSource = this.createOccurrenceVectorSource(this.celGeoJsonServiceBaseUrl);
    this.occVectorSource = vectorSource;

    return new VectorLayer({
      source: this.occVectorSource,
      style: this.createOccurrenceLayerStyle()

    });
  }

  private createBrgmLayer() {

    return new OlTileLayer({
      source: new TileWMS({
        title: 'BRMG - carte géologie',
        url: 'http://geoservices.brgm.fr/geologie',
        params: {'LAYERS': 'Geologie', 'TILED': true},

        transition: 0
      })
    });

  }

  private createGoogleHybridLayer() {

    return new OlTileLayer({
      source: new OlXYZ({
            url: 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'
        })
    });

  }

  private _initMap() {
    this.layer = this.createOlLayer();
    this.occLayer = this.createOccurrenceLayer();
    this.view = new OlView({
      center: fromLonLat([6.661594, 50.433237]),
      zoom: 3
    });

    return new OlMap({
      target: 'map',
      //  layers: [this.layer, this.brgmLayer, this.googleHybridLayer, this.occLayer],
      layers: [this.layer, this.occLayer],
      view: this.view
    });
  }


  ngAfterViewInit() {


  // ngOnInit() {

    this.map = this._initMap();
    this.select = new Select({
      hitTolerance: 10  ,
      style: this.createSelectedOccurrenceLayerStyle()
    });

    const self = this;

    if (this.select !== null) {
        this.map.addInteraction(this.select);
        this.select.on('select', function(e) {
    console.log('ONSELECT');

            // Set local "selected" var to selected openLayers feature objects:
            self.setSelected(e.target.getFeatures());
    console.debug(e.target.getFeatures());
    console.log('/ONSELECT');
        });
    }



      const selectedFeatures = this.select.getFeatures();

      // a DragBox interaction used to select features by drawing boxes
      const dragBox = new DragBox({
        condition: platformModifierKeyOnly
      });

      this.map.addInteraction(dragBox);

      dragBox.on('boxend', function() {

        // features that intersect the box are added to the collection of
        // selected features
        const extent = dragBox.getGeometry().getExtent();
        self.occVectorSource.forEachFeatureIntersectingExtent(extent, function(feature) {
          selectedFeatures.push(feature);
            self.selected.push(feature);

        });
                    self.setSelected(selectedFeatures);

      });

      // clear selection when drawing a new box and when clicking on the map
      dragBox.on('boxstart', function() {
        selectedFeatures.clear();
         self.selected = [];
      });

      // var infoBox = document.getElementById('info');

      selectedFeatures.on(['add', 'remove'], function() {
        const names = selectedFeatures.getArray().map(function(feature) {
          return feature.get('userSciName');
        });
/*
        if (names.length > 0) {
          console.log(names.join(', '));
        } else {
          console.log('No occ selected');
        }
*/
      });
    // this.map.addControl(new LayerSwitcher());

    if ( !this.isMobile ) {
      this.snackBar.open(
        'Pour sélectionner plusieurs observations, cliquer sur ces dernières en maintenant la touche "shift" enfoncée ou en traçant un rectangle avec la touche "control" enfoncée.',
        'Fermer',
        { duration: 5000 });
    }
  }

    addBoxSelectionInteractionToMap() {


    }

    openImportDialog() {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        this.importDialogRef = this.dialog.open(ImportDialogComponent, dialogConfig);

        this.importDialogRef
            .afterClosed()
            .subscribe( file => {
                this.importSpreadsheet(file);
            });
    }

  bulkPublish() {
      const occz = this.getSelectedOccurrences();
      const privateOccz = occz.filter(occ => (occ.isPublic == false) );
      const privateOccIdz = privateOccz.map(function(occurrence) {
        return occurrence.id;
      });

      if ( privateOccIdz.length > 0 ) {
          this.dataSource.bulkReplace(privateOccIdz, {isPublic: true}).subscribe(
              data => {
                  let nbOfPublishedOccz = 0;
                  for (const d of data)  {
                    if ( d[Object.keys(d)[0]].message.isPublic == true ) {
                      nbOfPublishedOccz++;
                    }
                  }
                  let msg;
                  if ( nbOfPublishedOccz > 0 ) {
                    msg = 'Les observations complètes ont été publiées avec succès';
                  } else {
                    msg = 'Observation(s) incomplète(s) : aucune observation publiée. Consulter l’aide pour plus d’informations sur les conditions de publication.';
                  }
                  this.snackBar.open(
                  msg,
                  'Fermer',
                  { duration: 3500 });
                  this.redrawMap();

              },
              error => this.snackBar.open(
                  'Une erreur est survenue. ' + error,
                  'Fermer',
                  { duration: 3500 })
          );
    } else {
        this.snackBar.open(
          'Aucune observation privée. Aucune observation à publier.',
          'Fermer',
          { duration: 3500 });
    }
  }

    bulkUnpublish() {
        const ids = this.getSelectedIds();
        this.dataSource.bulkReplace(ids, {isPublic: false}).subscribe(
            data => {
                this.snackBar.open(
                'Les observations ont été dépubliées avec succès.',
                'Fermer',
                { duration: 3500 });

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer',
                { duration: 3500 })
        );
    }



  edit() {
    // single edit:
    if (this.getSelectedCount() == 1) {
      const ids = this.getSelectedIds();
      this.navigateToEditOccurrenceForm(ids[0]);
    } else if (this.getSelectedCount() > 1) {
      this.bulkEdit();
    }
  }



  bulkEdit() {
      const ids = this.getSelectedIds();
      let strIds = '';
      for (const id of ids) {
          strIds += id;
          strIds += ',';
      }
      // Remove the trailing comma:
      strIds = strIds.substring(0, strIds.length - 1);
      this.navigateToMultiEditOccurrenceForm(strIds);
  }

    private getSelectedIds() {
        if (this.selected != null) {
          return this.selected.array_.map(function(feature) {
            return feature.values_.id;
      });

        }
             return [];
    }

    private getSelectedOccurrences() {
      return this.selected.array_.values_map(function(feature) {
        return feature.values_.id;
      });
    }


  private buildDialogConfig() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    return dialogConfig;
  }

  openConfirmDeletionDialog(value) {

    const dialogConfig = this.buildDialogConfig();
    dialogConfig.data = this._confirmDeletionMsg;
    const confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

    confirmDialogRef
      .afterClosed()
      .subscribe( response => {
          if (response == true) {
            this.bulkDelete();
          }
      });
  }

    bulkDelete() {

        const ids = this.getSelectedIds();

        this.dataSource.bulkRemove(ids).subscribe(
            data => {
                this.redrawMap();
                this.snackBar.open(
                'Les observations ont été supprimées avec succès.',
                'Fermer',
                { duration: 3500 });

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer',
                { duration: 3500 })
        );
    }

    generatePdfEtiquette() {
      const ids = this.getSelectedIds();
      this.dataSource.generatePdfEtiquette(ids).subscribe(data => {
        this.dldService.downloadBinary(data,  'application/pdf', 'cel-etiquettes-');
      });
    }

    importSpreadsheet(file: File) {
        const snackBarRef = this.snackBar.open('Import en cours. Cela peut prendre un certain temps.', 'Fermer', {
            duration: 3500
        });

        this.dataSource.importSpreadsheet(file).subscribe(
            data => {
                this.redrawMap();
                this.snackBar.open(
                'Les observations ont été importées avec succès.',
                'Fermer',
                { duration: 3500 });

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer',
                { duration: 3500 })
        );
        this.importDialogRef.close();
    }

  toggleDetailSlideNav() {
      if (this.detailDrawer.opened) {
        this.detailDrawer.close();

      } else {
        this.detailDrawer.open();

      }
  }
    onDrawerCloseStart() {

    }



}
