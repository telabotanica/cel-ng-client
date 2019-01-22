import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from "@angular/common/http";
import { 
  Router, ActivatedRoute } from "@angular/router";
import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { GeoJSON } from 'ol/format';
//import { GeoJSON } from '../../../utils/GeoJSON.js';
import { OSM, Vector as VectorSource } from 'ol/source'
// import Select from 'ol/interaction/Select';
import { DragBox, Select } from 'ol/interaction';
import { click, pointerMove, altKeyOnly,platformModifierKeyOnly} from 'ol/events/condition';
import TileWMS from 'ol/source/TileWMS';
import LayerSwitcher from 'ol-layerswitcher/src/ol-layerswitcher';
import { 
  MatPaginator, 
  MatSort, 
  MatDialogRef,
  MatTableDataSource, 
  MatDialogConfig, 
  MatSnackBar,
  MatDialog } from "@angular/material";

//import { LayerSwitcher } from 'ol/control';
import {OccurrenceFilters} from "../../../model/occurrence/occurrence-filters.model";
import { Occurrence } from "../../../model/occurrence/occurrence.model";
import { OccurrencesDataSource } from "../../../services/occurrence/occurrences.datasource";
import { ImportDialogComponent } from "../../../components/occurrence/import-dialog/import-dialog.component";

@Component({
  selector: 'app-occurrence-map',
  templateUrl: './occurrence-map.component.html',
  styleUrls: ['./occurrence-map.component.css']
})
export class OccurrenceMapComponent implements OnInit {

  private _occFilters: OccurrenceFilters;
  // The ids of selected occurrences:
  selected = [];
  importDialogRef: MatDialogRef<ImportDialogComponent>;
  source: OlXYZ;
  private map: OlMap;
  private layer: OlTileLayer;
  private occLayer: VectorLayer;
  private celGeoJsonServiceBaseUrl = environment.api.baseUrl + '/occurrences.geojson';
  private celGeoJsonServiceFilteredUrl;

  private googleHybridLayer;

  @Input() set occFilters(newOccFilters: OccurrenceFilters) {
    if (  newOccFilters != null) {
      this._occFilters = newOccFilters;
      this.redrawMap();
    }
  }

  navigateToCreateOccurrenceForm() {
      this.router.navigateByUrl('/occurrence-form');
  }

  getSelectedCount() {
      return this.selected.length;
  }

  private redrawMap() {
    let geoJsonUrl = this.celGeoJsonServiceBaseUrl;

    if (this._occfilters != null && this._occfilters != undefined) {
      geoJsonUrl += ('?' + this._occFilters.toUrlParameters());
    }

alert(geoJsonUrl);
    var s = new VectorSource({
        url: geoJsonUrl,
        format: new GeoJSON()
    });

    this.occLayer.setSource(s);
  }
 
  constructor(
    private http:HttpClient, 
    private dataSource:OccurrencesDataSource, 
    private dialog: MatDialog, 
    private router: Router,
    public snackBar: MatSnackBar ) { }

  private createOlLayer() {
    return new OlTileLayer({
      source: new OlXYZ({
        title: 'OSM',
        //type: 'base',
        visible: true,
        url: 'http://tile.osm.org/{z}/{x}/{y}.png'})
    });
  }
  
  private createOccurrenceLayer() {
    this.occVectorSource = new VectorSource({
      title: 'Observations',
      url: this.celGeoJsonServiceBaseUrl ,
      visible: true,
      format: new GeoJSON()
    });

    return new VectorLayer({
      source: this.occVectorSource
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

  private createMap() {
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

  ngOnInit() {

    this.map = this.createMap();
    var select = new Select();
    var self = this;

    if (select !== null) {
        this.map.addInteraction(select);
        select.on('select', function(e) {
            // bind local variable to OL event value
            self.selected= e.selected;
        });
    }


      var selectedFeatures = select.getFeatures();

      // a DragBox interaction used to select features by drawing boxes
      var dragBox = new DragBox({
        condition: platformModifierKeyOnly
      });

      this.map.addInteraction(dragBox);

      dragBox.on('boxend', function() {

        // features that intersect the box are added to the collection of
        // selected features
        var extent = dragBox.getGeometry().getExtent();
        self.occVectorSource.forEachFeatureIntersectingExtent(extent, function(feature) {
          selectedFeatures.push(feature);
            self.selected.push(feature);

        });
      });

      // clear selection when drawing a new box and when clicking on the map
      dragBox.on('boxstart', function() {
        selectedFeatures.clear();
         self.selected =[];
      });

      //var infoBox = document.getElementById('info');

      selectedFeatures.on(['add', 'remove'], function() {
        var names = selectedFeatures.getArray().map(function(feature) {
          return feature.get('userSciName');
        });
        if (names.length > 0) {
          console.log(names.join(', '));
        } else {
          console.log('No occ selected');
        }
      });


    //this.map.addControl(new LayerSwitcher());

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
        let ids = this.getSelectedIds();
        this.dataSource.bulkReplace(ids, {isPublic: true}).subscribe(
            data => {
                this.snackBar.open(
                'Les observations ont été publiées avec succès.', 
                'Fermer', 
                { duration: 1500 });

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error, 
                'Fermer', 
                { duration: 1500 })
        )
    }

    bulkUnpublish() {
        let ids = this.getSelectedIds();
        this.dataSource.bulkReplace(ids, {isPublic: false}).subscribe(
            data => {
                this.snackBar.open(
                'Les observations ont été dépubliées avec succès.', 
                'Fermer', 
                { duration: 1500 });

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error, 
                'Fermer', 
                { duration: 1500 })
        )
    }

    private getSelectedIds() {

      return this.selected.map(function(occurrence) {
          return occurrence.values_.id;
        });
    }

    bulkDelete() {

        let ids = this.getSelectedIds();

        this.dataSource.bulkRemove(ids).subscribe(
            data => {
                this.redrawMap();
                this.snackBar.open(
                'Les observations ont été supprimées avec succès.', 
                'Fermer', 
                { duration: 1500 });

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error, 
                'Fermer', 
                { duration: 1500 })
        );
    }

    generatePdfEtiquette() {
        let ids = this.getSelectedIds();
        this.dataSource.generatePdfEtiquette(ids).subscribe(resp => {
            this.downloadPdfEtiquette(resp);
        });
    }
  
    private downloadPdfEtiquette(data: any) {
        var blob = new Blob([data], { type: "application/pdf"});
        var url = window.URL.createObjectURL(blob);
        var pwa = window.open(url);
        //@todo use an angular material dialog
        if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
            alert( 'Merci de désactiver votre bloqueur de popups. Il empêche le téléchargement du fichier des étiquettes.');
        }
    }

    importSpreadsheet(file: File) {
        let snackBarRef = this.snackBar.open('Import en cours. Cela peut prendre un certain temps.', 'Fermer', {
            duration: 1500
        });

        this.dataSource.importSpreadsheet(file).subscribe(
            data => {
                this. redrawMap();
                this.snackBar.open(
                'Les observations ont été importées avec succès.', 
                'Fermer', 
                { duration: 1500 });

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error, 
                'Fermer', 
                { duration: 1500 })
        );
        this.importDialogRef.close(); 
    }


}
