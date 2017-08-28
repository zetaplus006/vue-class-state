import { Service, createDecorator } from 'vubx';
import Vue from 'vue';
const obverable = createDecorator(Vue);
@obverable()
export default class AsyncService extends Service {
    text = 'AsyncService';
}