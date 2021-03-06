import Ember from 'ember';
import { executeTest } from './execute-folv-test';
import { loadingLocales, refreshListByFunction } from './folv-tests-functions';

import I18nRuLocale from 'ember-flexberry/locales/ru/translations';

// Need to add sort by multiple columns.
executeTest('check sorting with default setting', (store, assert, app) => {
  assert.expect(9);
  let path = 'components-acceptance-tests/flexberry-objectlistview/folv-paging';
  visit(path);
  click('.ui.clear-sorting-button');
  andThen(() => {

    // Check page path.
    assert.equal(currentPath(), path);
    let controller = app.__container__.lookup('controller:' + currentRouteName());

    let $olv = Ember.$('.object-list-view ');

    Ember.run(() => {
      loadingLocales('ru', app).then(() => {
        // Refresh function.
        let refreshFunction =  function() {
          $thead.click();
        };

        let $thead = Ember.$('th.dt-head-left', $olv)[0];
        let $ord = Ember.$('.object-list-view-order-icon', $thead);
        let $divOrd = Ember.$('div', $ord);

        assert.equal($divOrd.attr('title'), Ember.get(I18nRuLocale, 'components.object-list-view.sort-ascending'), 'title is Order ascending');
        assert.equal(Ember.$.trim($divOrd.text()), String.fromCharCode('9650') + '1', 'sorting symbol added');
        assert.equal(controller.sort, '+name', 'up sorting in URL');

        let done1 = assert.async();
        refreshListByFunction(refreshFunction, controller).then(() => {
          let $thead = Ember.$('th.dt-head-left', $olv)[0];
          let $ord = Ember.$('.object-list-view-order-icon', $thead);
          let $divOrd = Ember.$('div', $ord);

          assert.equal($divOrd.attr('title'), Ember.get(I18nRuLocale, 'components.object-list-view.sort-descending'), 'title is Order descending');
          assert.equal(Ember.$.trim($divOrd.text()), String.fromCharCode('9660') + '1', 'sorting symbol changed');
          assert.equal(controller.sort, '-name', 'down sorting in URL');

          let done2 = assert.async();
          refreshListByFunction(refreshFunction, controller).then(() => {
            assert.equal(controller.sort, null, 'no sorting in URL');
            let done3 = assert.async();
            refreshListByFunction(refreshFunction, controller).then(() => {
              assert.equal(controller.sort, '+name', 'up sorting in URL');
              done3();
            });
            done2();
          });
        }).finally(() => {
          done1();
        });
      });
    });
  });
});
