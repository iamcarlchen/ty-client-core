<template>
  <div>
      {{v}} <a href="javacript:void(0);" v-if="showButton" @click="generate">生成UUID</a>
  </div>
</template>

<script>
import Util from '../../libs/util';

    export default {
        name: 'bb-uuid',
        props: {
            value:{
              type:[String,Number]
            },
            length:{
              type:Number
            },
            radix:{
              type:Number
            }
        },
        data() {
            return {
                v:this.value,
                showButton:false
            }
        },
        watch: {
            value(val){
                this.v = val;
            }
        },
        created: function () {
            if(!this.value){
                this.generate();
            }
        },
        mounted:function(){
        },
        methods: {
            generate:function(){
                var val = Util.uuid(this.length,this.radix);
                this.v = val;
                this.$emit('input',val);
                this.$emit('change',val);
            }
        }
    }
</script>