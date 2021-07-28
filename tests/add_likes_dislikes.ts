import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import LikeApi from '../src/http/LikeApi';
import { allure } from 'allure-mocha/runtime';

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;

describe('Функционал добавления лайков и дизлайков коту', async () => {
  let json_cat;

  beforeEach('Найдём случайного котика', async () => {
    await allure.step('Выбор кота', async () => {
      const all_cats = await CoreApi.getAllCats();
      console.info('Выполнили запрос GET /getAllCats');

      const length_group = all_cats.data.groups.length;
      const number_group = getRandomInt(length_group);

      const length_cats = all_cats.data.groups[number_group].cats.length;
      const number_cat = getRandomInt(length_cats);

      json_cat = all_cats.data.groups[number_group].cats[number_cat];

      allure.attachment('Выбранный кот',
        JSON.stringify(json_cat, null, 2),
        'application/json');

      console.info(`Получен рандомный кот - id: ${json_cat.id}, name: ${json_cat.name}\n`);
    });
  });

  it('Проверим добавление лайков коту', async () => {
    let add_likes;
    let count_likes;

    await allure.step('Получим сколько лайков будем добавлять',
      async () => {
        add_likes = getRandomInt(10);
        count_likes = json_cat.likes;

        console.info(`У кота было - ${count_likes} лайков`);
        console.info(`Добавим коту - ${add_likes} лайков`);
      });

    let response = await allure.step('Добавим лайки коту', async () => {
      let response;
      for (let i = 1; i <= add_likes; i++) {
        response = await LikeApi.likes(json_cat.id, { like: true, dislike: false });
        assert.equal(response.status, 200,
          `Ошибка при добавлении лайков. Статус код ${response.status}`);
      }
      return response;
    });

    allure.attachment('Было лайков',
      JSON.stringify(count_likes, null, 2), 'application/json');
    allure.attachment('Стало лайков',
      JSON.stringify(response.data.likes, null, 2), 'application/json');
    allure.attachment('Сколько должно быть лайков',
      JSON.stringify(count_likes + add_likes, null, 2), 'application/json');

    console.info(`Добавили ${add_likes} лайков коту с id ${json_cat.id}`);
    console.info(`Количество лайков после добавления - ${response.data.likes}\n`);

    assert.equal(response.data.likes, count_likes + add_likes,
      `Количество лайков не совпадает`);
  });

  it('Проверим добавление дизлайков коту', async () => {
    let add_dislikes;
    let count_dislikes;

    await allure.step('Получим сколько дизлайков будем добавлять',
      async () => {
        add_dislikes = getRandomInt(10);
        count_dislikes = json_cat.dislikes;

        console.info(`У кота было - ${count_dislikes} дизлайков`);
        console.info(`Добавим коту - ${add_dislikes} дизлайков`);
      });

    let response = await allure.step('Добавим дизлайки коту', async () => {
      let response;
      for (let i = 1; i <= add_dislikes; i++) {
        response = await LikeApi.likes(json_cat.id, { like: false, dislike: true });
        assert.equal(response.status, 200,
          `Ошибка при добавлении дизлайков. Статус код ${response.status}`);
      }
      return response;
    });

    allure.attachment('Было дизлайков',
      JSON.stringify(count_dislikes, null, 2), 'application/json');
    allure.attachment('Стало дизлайков',
      JSON.stringify(response.data.dislikes, null, 2), 'application/json');
    allure.attachment('Сколько должно быть дизлайков',
      JSON.stringify(count_dislikes + add_dislikes, null, 2), 'application/json');

    console.info(`Добавили ${add_dislikes} дизлайков коту с id ${json_cat.id}`);
    console.info(`Количество дизлайков после добавления - ${response.data.dislikes}\n`);

    assert.equal(response.data.dislikes, count_dislikes + add_dislikes,
      `Количество дизлайков не совпадает`);
  });

});
