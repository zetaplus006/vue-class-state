<template>
    <div>
        <h4>demo</h4>
        <ul>
            <li v-for="(person , index) in persons">{{person.name}}</li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { AppService } from './appService';
const appService = new AppService();
console.log(appService);
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
        setInterval(() => {
            appService.addPerson();
        }, 2000)
    }
};
</script>

<style>

</style>
