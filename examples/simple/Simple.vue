<template>
    <div>
        <h4>demo</h4>
        <ul>
            <li v-for="(person , index) in persons"
                :key="index">{{person.name}}</li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { AppService } from './appService';
import { Service, devtool } from 'vubx';
const appService = new AppService();
devtool(appService);
console.log(appService, appService instanceof Service);

export default {
    computed: {
        persons (): any {
            return appService.list;
        },
        appService () {
            return appService;
        }
    },
    mounted () {
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
