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
import { AppService, IPerson } from './appService';
// const appService = new AppService();
// console.log(appService);
export default {
    computed: {
        persons (): IPerson[] {
            // return appService.list;
            return []
        }
    },
    mounted () {
        setInterval(() => {
            // appService.addPerson();
        }, 1000)
    }
};
</script>

<style>

</style>
