/**
  @module ember-flexberry
 */

import Ember from 'ember';

/**
  Mixin for controller, that sorting on the list form.

  Example:
  ```javascript
  // app/controllers/employees.js
  import Ember from 'ember';
  import SortableController from 'ember-flexberry/mixins/sortable-controller'
  export default Ember.Controller.extend(SortableController, {
  });
  ```

  ```javascript
  // app/routes/employees.js
  import Ember from 'ember';
  import SortableRoute from 'ember-flexberry/mixins/sortable-route'
  export default Ember.Route.extend(SortableRoute, {
  });
  ```

  ```handlebars
  <!-- app/templates/employees.hbs -->
  ...
  {{flexberry-objectlistview
    ...
    orderable=true
    sortByColumn=(action 'sortByColumn')
    addColumnToSorting=(action 'addColumnToSorting')
    ...
  }}
  ...
  ```

  @class SortableController
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
 */
export default Ember.Mixin.create({
  /**
    Default value for sorting.

    @property sortDefaultValue
    @type String
   */
  sortDefaultValue: undefined,

  /**
    String with sorting parameters.

    @property sort
    @type String
   */
  sort: Ember.computed.oneWay('sortDefaultValue'),

  /**
    Object with sorting parameters for model.

    @property computedSorting
    @type Object
    @readOnly
   */
  computedSorting: Ember.computed('model.sorting', function() {
    let sorting = this.get('model.sorting');
    let result = {};

    if (sorting) {
      for (let i = 0; i < sorting.length; i++) {
        let propName = sorting[i].propName;
        let sortDef = {
          sortAscending: sorting[i].direction === 'asc' ? true : false,
          sortNumber: i + 1
        };
        result[propName] = sortDef;
      }
    }

    return result;
  }),

  /**
    Defines which query parameters the controller accepts. [More info.](http://emberjs.com/api/classes/Ember.Controller.html#property_queryParams).

    @property queryParams
    @type Array
    @default ['sort']
   */
  queryParams: ['sort'],

  actions: {
    /**
      Sorting list by column.

      @method actions.sortByColumn
      @param {Object} column Column for sorting.
     */
    sortByColumn(column) {
      let propName = column.propName;
      let oldSorting = this.get('model.sorting');
      let newSorting = [];
      let sortDirection;
      if (oldSorting) {
        sortDirection = 'asc';
        for (let i = 0; i < oldSorting.length; i++) {
          if (oldSorting[i].propName === propName) {
            sortDirection = this._getNextSortDirection(oldSorting[i].direction);
            break;
          }
        }
      } else {
        sortDirection = 'asc';
      }

      if (sortDirection !== 'none') {
        newSorting.push({ propName: propName, direction: sortDirection });
      }

      let sortQueryParam = this._serializeSortingParam(newSorting);
      this.set('sort', sortQueryParam);
    },

    /**
      Add column into end list sorting.

      @method actions.addColumnToSorting
      @param {Object} column Column for sorting.
     */
    addColumnToSorting(column) {
      let propName = column.propName;
      let oldSorting = this.get('model.sorting');
      let newSorting = [];
      let changed = false;

      for (let i = 0; i < oldSorting.length; i++) {
        if (oldSorting[i].propName === propName) {
          let newDirection = this._getNextSortDirection(oldSorting[i].direction);
          if (newDirection !== 'none') {
            newSorting.push({ propName: propName, direction: newDirection });
          }

          changed = true;
        } else {
          newSorting.push(oldSorting[i]);
        }
      }

      if (!changed) {
        newSorting.push({ propName: propName, direction: 'asc' });
      }

      let sortQueryParam = this._serializeSortingParam(newSorting);
      this.set('sort', sortQueryParam);
    },
  },

  /**
    Convert object with sorting parameters into string.

    @method _serializeSortingParam
    @param {Object} sorting Object with sorting parameters.
    @returns {String} String with sorting parameters.
    @private
   */
  _serializeSortingParam(sorting) {
    return sorting.map((element) => {
      return (element.direction === 'asc' ? '+' : '-') + element.propName;
    }).join('') || this.get('sortDefaultValue');
  },

  /**
    Get next sorting direction.

    @method _getNextSortDirection
    @param {String} currentDirection Current sorting direction.
    @return {String} Sorting direction.
    @private
   */
  _getNextSortDirection(currentDirection) {
    return currentDirection === 'asc' ? 'desc' : 'none';
  },
});
