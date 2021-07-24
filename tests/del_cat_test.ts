import { assert, expect } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { allure } from 'allure-mocha/runtime';

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;

describe('Функционал удаления случайного кота', async () => {
  let cat_id = null;

  it('Удаление существующего кота', async () => {
    const all_cats = await CoreApi.getAllCats();
    console.info('Выполнили запрос GET /getAllCats');

    const length_group = all_cats.data.groups.length;
    const number_group = getRandomInt(length_group);

    const length_cats = all_cats.data.groups[number_group].cats.length;
    const number_cat = getRandomInt(length_cats);

    const cat = all_cats.data.groups[number_group].cats[number_cat];
    cat_id = cat.id;

    const response = await allure.step(
      `Выполнен запрос DELETE /cats/{catId}/remove с параметром ${cat_id}`,
      async () => {
        console.info(`Удалим котика с id == ${cat_id}`);
        const remove_response = await CoreApi.removeCat(cat_id);
        const data = JSON.stringify(remove_response.data, null, 2);
        console.info(`Получен ответ на запрос DELETE /cats/{catId}/remove:\n`, data);
        allure.attachment('attachment', data, 'application/json');
        return remove_response;
      },
    );

    await allure.step(
      'Выполнена проверка соответствия значения id кота из ответа с переданным нами в запрос',
      () => {
        console.info('Проверим, что в ответе будет тот же id, что и в запросе');
        assert.equal(response.data.id, cat_id, 'Id не соответствуют');

        console.info(`Id котика в запросе: ${cat_id} == Id котика в ответе ${response.data.id}`);
      },
    );

  });

  it('Проверка, что котик удалился', async () => {
    const response = await allure.step(
      `Выполнен запрос GET /get-by-id c параметром ${cat_id}`,
      async () => {
        console.info('Выполняется запрос GET /get-by-id');
        const response = await CoreApi.getCatById(cat_id);
        const data = JSON.stringify(response.data, null, 2);
        console.info('Получен ответ на запрос GET /get-by-id:\n', data);
        allure.attachment('attachment', data, 'application/json');
        return response;
      },
    );

    await allure.step(
      'Выполнена проверка кода ответа',
      () => {
        console.info('Проверим, что код ответа равен 404.')
        assert.equal(response.status, 404, 'Статус код не тот, который ожидали');
        console.info('Код ответа совпал.')
      },
    );
  });

});