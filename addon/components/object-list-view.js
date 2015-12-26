import Ember from 'ember';
import BaseComponent from './flexberry-base';

export default BaseComponent.extend({
  tagName: 'table',
  classNames: [
    'object-list-view',

    // Semantic UI style.
    'table',

    // DataTables styles: https://datatables.net/manual/styling/classes.
    'dataTable',
    'cell-border',
    'compact',
    'hover',
    'stripe'
  ],

  modelProjection: null,
  content: null,
  sorting: null,
  selectedRecord: null,
  selectedRecords: null,
  customColumnAttributes: null,

  headerCellComponent: 'object-list-view-header-cell',
  cellComponent: 'object-list-view-cell',

  action: 'rowClick',
  addColumnToSorting: 'addColumnToSorting',
  sortByColumn: 'sortByColumn',
  rowClickable: true,
  headerClickable: true,
  showCheckBoxInRow: false,
  showDeleteButtonInRow: false,

  /**
   * Service that triggers groupedit events.
   *
   * @property groupEditEventsService
   * @type Service
   */
  groupEditEventsService: Ember.inject.service('groupedit-events'),

  init() {
    this._super(...arguments);
    this.set('selectedRecords', Ember.A());
    this.get('groupEditEventsService').on('groupEditAddRow', this, this._addRow);
    this.get('groupEditEventsService').on('groupEditDeleteRows', this, this._deleteRows);
  },

  actions: {
    rowClick: function(record) {
      this.set('selectedRecord', record);
      if (this.rowClickable) {
        this.sendAction('action', record);
      }
    },
    headerCellClick: function(column, event) {
      if (this.headerClickable) {
        var action = event.ctrlKey ? 'addColumnToSorting' : 'sortByColumn';
        this.sendAction(action, column);
      }
    },
    deleteRow: function(record) {
      if (confirm('Do you really want to delete this record?')) {
        var rowToDelete = this._getRowById(record.get('id'));
        rowToDelete.remove();
        record.deleteRecord();
        var componentName = this.get('componentName');
        this.get('groupEditEventsService').rowDeletedTrigger(componentName, record);
      }
    },
    selectRow: function(record) {
      var selectedRecords = this.get('selectedRecords');
      var recordId = record.get('id');
      var selectedRow = this._getRowById(recordId);
      var checkBoxChecked = selectedRow.find('input[type=checkbox]').prop('checked');
      if (checkBoxChecked) {
        if (selectedRecords.indexOf(record) === -1) {
          selectedRecords.pushObject(record);
        }
      }
      else {
        selectedRecords.removeObject(record);
      }

      var componentName = this.get('componentName');
      this.get('groupEditEventsService').rowSelectedTrigger(componentName, record, selectedRecords.length);
    }
  },

  didInsertElement: function() {
    this.$().dataTable({
      info: false,
      ordering: false,
      paging: false,
      searching: false
    });
  },

  columns: Ember.computed('modelProjection', function() {
    var projection = this.get('modelProjection');
    if (!projection) {
      throw new Error('No projection was defined.');
    }

    let cols = this._generateColumns(projection.attributes);
    return cols;
  }),

  willDestroy() {
    this.get('groupEditEventsService').off('groupEditAddRow', this, this._addRow);
    this.get('groupEditEventsService').off('groupEditDeleteRows', this, this._deleteRows);
    this._super(...arguments);
  },

  _generateColumns: function(attributes, columnsBuf, relationshipPath) {
    columnsBuf = columnsBuf || [];
    relationshipPath = relationshipPath || '';

    for (let attrName in attributes) {
      let currentRelationshipPath = relationshipPath;
      if (!attributes.hasOwnProperty(attrName)) {
        continue;
      }

      let attr = attributes[attrName];
      switch (attr.kind) {
        case 'hasMany':
          break;

        case 'belongsTo':
          if (!attr.options.hidden) {
            let bindingPath = currentRelationshipPath + attrName;
            if (attr.options.displayMemberPath) {
              bindingPath += '.' + attr.options.displayMemberPath;
            } else {
              bindingPath += '.id';
            }

            let column = this._createColumn(attr, bindingPath);
            columnsBuf.push(column);
          }

          currentRelationshipPath += attrName + '.';
          this._generateColumns(attr.attributes, columnsBuf, currentRelationshipPath);
          break;

        case 'attr':
          if (attr.options.hidden) {
            break;
          }

          let bindingPath = currentRelationshipPath + attrName;
          let column = this._createColumn(attr, bindingPath);
          columnsBuf.push(column);
          break;

        default:
          throw new Error(`Unknown kind of projection attribute: ${attr.kind}`);
      }
    }

    return columnsBuf;
  },

  _getRowById: function(id) {
    var _this = this;
    var row = null;
    this.$('tbody tr').each(function() {
      var currentKey = _this.$(this).find('td:eq(0) div:eq(0)').text();
      if (currentKey === id) {
        row = _this.$(this);
        return false;
      }
    });
    return row;
  },

  _addRow: function(componentName) {
    if (componentName === this.get('componentName')) {
      alert('It is happend');
    }
  },

  _deleteRows: function(componentName) {
    if (componentName === this.get('componentName')) {
      if (confirm('Do you really want to delete selected records?')) {
        var _this = this;
        var selectedRecords = this.get('selectedRecords');
        var count = selectedRecords.length;
        selectedRecords.forEach(function(item, index, enumerable) {
          var recordId = item.get('id');
          var selectedRow = _this._getRowById(recordId);
          selectedRow.remove();
          item.deleteRecord();
          _this.get('groupEditEventsService').rowDeletedTrigger(componentName, item);
        });
        selectedRecords.clear();
        this.get('groupEditEventsService').rowsDeletedTrigger(componentName, count);
      }
    }
  },

  _createColumn: function(attr, bindingPath) {
    let cellComponent = this.get('cellComponent');
    if (typeof cellComponent === 'function') {
      cellComponent = cellComponent(attr, bindingPath);
    }

    let column = {
      header: attr.caption,
      propName: bindingPath, // TODO: rename column.propName
      cellComponent: cellComponent
    };

    let customColumnAttributesFunc = this.get('customColumnAttributes');
    if (customColumnAttributesFunc) {
      let customColAttr = customColumnAttributesFunc(attr, bindingPath);
      if (customColAttr && (typeof customColAttr === 'object')) {
        Ember.$.extend(true, column, customColAttr);
      }
    }

    let sortDef;
    let sorting = this.get('sorting');
    if (sorting && (sortDef = sorting[bindingPath])) {
      column.sorted = true;
      column.sortAscending = sortDef.sortAscending;
      column.sortNumber = sortDef.sortNumber;
    }

    return column;
  }
});
