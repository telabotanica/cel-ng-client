import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient, HttpParams } from "@angular/common/http";
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from "rxjs/operators";


import { PhotoTagService } from "../../../services/photo/photo-tag.service";

/**
 * Node for PhotoTag item
 */
export class PhotoTagItemNode {
  children: PhotoTagItemNode[];
  item: string;
}

/** Flat PhotoTag item node with expandable and level information */
export class  PhotoTagItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a PhotoTag item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class FileTreeBuilder {
  dataChange = new BehaviorSubject<PhotoTagItemNode[]>([]);

  get data(): PhotoTagItemNode[] { return this.dataChange.value; }

  constructor(private http: HttpClient, private photoTagService:PhotoTagService) {
	//this.http.get<any[]>("http://10.99.34.5:8080/api/PhotoTagTrees").subscribe((jsonTree: any) => this.initialize(jsonTree));
    photoTagService.getCollectionAsTree().subscribe((jsonTree: any) => this.initialize(jsonTree));
  }


  initialize(jsonTree) {

    // Build the tree nodes from Json object. The result is a list of 'PhotoTagItemNode' with nested
    //     file node as children.
    const data = this.buildFileTree(jsonTree, 0);

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The 'value' is the Json object, or a sub-tree of a Json object.
   * The return value is the list of 'PhotoTagItemNode'.
   */
  buildFileTree(obj: {[key: string]: any}, level: number): PhotoTagItemNode[] {
    return Object.keys(obj).reduce<PhotoTagItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new PhotoTagItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to PhotoTag list */
  insertItem(parent: PhotoTagItemNode, name: string) {
    if (parent.children) {
      parent.children.push({item: name} as PhotoTagItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: PhotoTagItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
}

/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'photo-tag-tree-component',
  templateUrl: 'photo-tag-tree.component.html',
  providers: [FileTreeBuilder]
})
export class PhotoTagTreeComponent {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<PhotoTagItemFlatNode, PhotoTagItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<PhotoTagItemNode, PhotoTagItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: PhotoTagItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';



  treeControl: FlatTreeControl<PhotoTagItemFlatNode>;

  treeFlattener: MatTreeFlattener<PhotoTagItemNode, PhotoTagItemFlatNode>;

  dataSource: MatTreeFlatDataSource<PhotoTagItemNode, PhotoTagItemFlatNode>;


  /** The selection for checklist */
  photoTagSelection = new SelectionModel<PhotoTagItemFlatNode>(false);

  constructor(private database: FileTreeBuilder) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<PhotoTagItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });

  }

  getLevel = (node: PhotoTagItemFlatNode) => node.level;

  isExpandable = (node: PhotoTagItemFlatNode) => node.expandable;

  getChildren = (node: PhotoTagItemNode): PhotoTagItemNode[] => node.children;

  hasChild = (_: number, _nodeData: PhotoTagItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: PhotoTagItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: PhotoTagItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
        ? existingNode
        : new PhotoTagItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: PhotoTagItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.photoTagSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: PhotoTagItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.photoTagSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the PhotoTag item selection. Select/deselect all the descendants node */
  PhotoTagItemSelectionToggle(node: PhotoTagItemFlatNode): void {
    this.photoTagSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);

    this.photoTagSelection.isSelected(node)
      ? this.photoTagSelection.select(...descendants)
      : this.photoTagSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child =>
      this.photoTagSelection.isSelected(child)
    );

    this.checkAllParentsSelection(node);

  }

  /** Toggle a leaf PhotoTag item selection. Check all the parents to see if they changed */
  PhotoTagLeafItemSelectionToggle(node: PhotoTagItemFlatNode): void {
    this.photoTagSelection.toggle(node);
   // this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: PhotoTagItemFlatNode): void {
    let parent: PhotoTagItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: PhotoTagItemFlatNode): void {
    const nodeSelected = this.photoTagSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.photoTagSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.photoTagSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.photoTagSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: PhotoTagItemFlatNode): PhotoTagItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: PhotoTagItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: PhotoTagItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode!, itemValue);
  }
}

