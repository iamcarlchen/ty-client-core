<template>  
    <div>
        <bb-dialog title="积木设置" size="middle" :isShow.sync="showDialog">
            <bb-config v-if="showDialog" @change="commit" v-model="itemValue"></bb-config>
        </bb-dialog>
        <bb-button @click="edit" :button="addButton"></bb-button>
        <bb-list :columns="columns" :value="valueBase" @edit="edit" @change="change" :editConfig="editConfig"></bb-list>
    </div>
</template>

<script>
    export default {
        name: 'bb-config-array',
        props: {
            value:{
                type:Array,
                default:function(){
                    return []
                }
            }
        },
        data() {
            return {
                valueBase:_TY_Tool.deepClone(this.value),
                formFields:[{                      
                    uuid:'bb-config-row',
                    alias:'bb-config',                   
                    aliasName:'积木编辑器',                                 
                    attributes:{
                        attributeName:'bbConfigRow'
                    }
                }],
                columns:[
                    {prop: 'aliasName',label: '积木名称',type:'defalut'},
                    {prop: 'alias',label: '积木别名',type:'defalut'},
                    {prop: 'uuid',label: '标识',type:'defalut'},
                ],
                editConfig:{
                   editable:['edit','up','down','remove']
                },
                showDialog:false,
                addButton:{
                    type:'text',
                    text:'添加',
                    icon:'ty-icon_faqi1'
                },
                itemValue:null,
                key:'add'
            }
        },
        watch: {
        },
        created: function () {
        },
        mounted:function(){

        },
        methods: {
            //提交表单修改
            commit:function(formData){
                const t = this;
                if(t.key == 'add'){
                    t.valueBase.push(formData);
                    t.key = t.valueBase.length - 1;
                }else{
                    t.valueBase[t.key] = formData;
                }
                t.$emit('input',t.valueBase);
                t.$emit('change',t.valueBase);
                t.showDialog = false;
            },
            //监听list中的修改
            change:function(arrayData){
                const t = this;
                t.$emit('input',arrayData);
                t.$emit('change',arrayData);
            },
            //进入编辑状态
            edit:function(formData,key){
                const t = this;
                if(typeof key == 'number'){
                    t.key = key;
                    t.itemValue = formData;
                }else{
                    t.key = 'add';
                    t.itemValue = {
                        uuid: _TY_Tool.uuid(),
                        alias: '',
                        aliasName: '', 
                        attributes: {},
                        animation: [],
                        interactives: [],
                        layout: {}
                    };
                }
                t.showDialog = true;
            }
        }
    }
</script>
<style lang='less'>    
</style>