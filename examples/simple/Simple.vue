<template>
    <div>
        <h4>simple demo</h4>
        <span>{{appService.sum}} </span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { AppService } from './appService';
const appService = new AppService().useStrict(false).useDevtool(false);

console.log(appService)
export default {
    computed: {
        appService() {
            return appService;
        }
    },
    mounted() {
        appService.start();
    }
};
</script>

