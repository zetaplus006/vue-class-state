<template>
    <div>
        <h4>{{appName}}</h4>
        <ul>
            <li v-for="(person , index) in persons" :key="index">{{person.name}}</li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { AppService, UserService } from './appService';
import { Service, devtool } from 'vubx';

const appService = new AppService('');
devtool(appService);
appService.appendChild<UserService>(new UserService(), 'userInfoOther', Symbol('userInfoOther'));
console.log(appService);


export default {
    computed: {
        persons(): any {
            return appService.list;
        },
        appService() {
            return appService;
        },
        appName() {
            return appService.name;
        }
    },
    mounted() {
        appService.addPerson();
        /* setTimeout(() => {
            appService.addPerson();
        }, 2000) */
        setTimeout(() => {
            appService.addPerson();
        }, 2000)
    }
};
</script>

<style>

</style>
