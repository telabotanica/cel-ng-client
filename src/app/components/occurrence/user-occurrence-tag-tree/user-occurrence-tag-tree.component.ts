import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient, HttpParams } from "@angular/common/http";
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from "rxjs/operators";


import { UserOccurrenceTagService } from "../../../services/occurrence/user-occurrence-tag.service";

/**
 * Node for UserOccurrenceTag item
 */
export class UserOccurrenceTagItemNode {
  children: UserOccurrenceTagItemNode[];
  item: string;
}

/** Flat UserOccurrenceTag item node with expandable and level information */
export class UserOccurrenceTagItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a UserOccurrenceTag item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class FileTreeBuilder {
  dataChange = new BehaviorSubject<UserOccurrenceTagItemNode[]>([]);

  get data(): UserOccurrenceTagItemNode[] { return this.dataChange.value; }

  constructor(private http: HttpClient, private userOccurrenceTagService:UserOccurrenceTagService) {
	//this.http.get<any[]>("http://10.99.34.5:8080/api/userOccurrenceTagTrees").subscribe((jsonTree: any) => this.initialize(jsonTree));
    userOccurrenceTagService.getCollectionAsTree().subscribe((jsonTree: any) => this.initialize(jsonTree));
  }


  initialize(jsonTree) {

    // Build the tree nodes from Json object. The result is a list of 'UserOccurrenceTagItemNode' with nested
    //     file node as children.
    const data = this.buildFileTree(jsonTree, 0);

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The 'value' is the Json object, or a sub-tree of a Json object.
   * The return value is the list of 'UserOccurrenceTagItemNode'.
   */
  buildFileTree(obj: {[key: string]: any}, level: number): UserOccurrenceTagItemNode[] {
    return Object.keys(obj).reduce<UserOccurrenceTagItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new UserOccurrenceTagItemNode();
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

  /** Add an item to UserOccurrenceTag list */
  insertItem(parent: UserOccurrenceTagItemNode, name: string) {
    if (parent.children) {
      parent.children.push({item: name} as UserOccurrenceTagItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: UserOccurrenceTagItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
}

/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'user-occurrence-tag-tree-component',
  templateUrl: 'user-occurrence-tag-tree.component.html',
  providers: [FileTreeBuilder]
})
export class UserOccurrenceTagTreeComponent {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<UserOccurrenceTagItemFlatNode, UserOccurrenceTagItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<UserOccurrenceTagItemNode, UserOccurrenceTagItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: UserOccurrenceTagItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';



  treeControl: FlatTreeControl<UserOccurrenceTagItemFlatNode>;

  treeFlattener: MatTreeFlattener<UserOccurrenceTagItemNode, UserOccurrenceTagItemFlatNode>;

  dataSource: MatTreeFlatDataSource<UserOccurrenceTagItemNode, UserOccurrenceTagItemFlatNode>;


  /** The selection for checklist */
  userOccurrenceTagSelection = new SelectionModel<UserOccurrenceTagItemFlatNode>(false);

  constructor(private database: FileTreeBuilder) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<UserOccurrenceTagItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });

  }

  getLevel = (node: UserOccurrenceTagItemFlatNode) => node.level;

  isExpandable = (node: UserOccurrenceTagItemFlatNode) => node.expandable;

  getChildren = (node: UserOccurrenceTagItemNode): UserOccurrenceTagItemNode[] => node.children;

  hasChild = (_: number, _nodeData: UserOccurrenceTagItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: UserOccurrenceTagItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: UserOccurrenceTagItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
        ? existingNode
        : new UserOccurrenceTagItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: UserOccurrenceTagItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.userOccurrenceTagSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: UserOccurrenceTagItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.userOccurrenceTagSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the UserOccurrenceTag item selection. Select/deselect all the descendants node */
  userOccurrenceTagItemSelectionToggle(node: UserOccurrenceTagItemFlatNode): void {
    this.userOccurrenceTagSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);

    this.userOccurrenceTagSelection.isSelected(node)
      ? this.userOccurrenceTagSelection.select(...descendants)
      : this.userOccurrenceTagSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child =>
      this.userOccurrenceTagSelection.isSelected(child)
    );

    this.checkAllParentsSelection(node);

  }

  /** Toggle a leaf UserOccurrenceTag item selection. Check all the parents to see if they changed */
  userOccurrenceTagLeafItemSelectionToggle(node: UserOccurrenceTagItemFlatNode): void {
    this.userOccurrenceTagSelection.toggle(node);
   // this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: UserOccurrenceTagItemFlatNode): void {
    let parent: UserOccurrenceTagItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: UserOccurrenceTagItemFlatNode): void {
    const nodeSelected = this.userOccurrenceTagSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.userOccurrenceTagSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.userOccurrenceTagSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.userOccurrenceTagSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: UserOccurrenceTagItemFlatNode): UserOccurrenceTagItemFlatNode | null {
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
  addNewItem(node: UserOccurrenceTagItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: UserOccurrenceTagItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode!, itemValue);
  }
}

