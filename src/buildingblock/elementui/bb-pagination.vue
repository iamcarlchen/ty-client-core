<template>
    <div :style="p_style">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="p_page"
            :page-sizes="p_pageSizes"
            :page-size="p_pageSize"
            :layout="layout"
            :total="p_totalItems">
        </el-pagination>
    </div>
</template>

<script>
    export default {
        name: 'bb-pagination',
        props: {
            //分页 每页大小字典
            pageSizes:{
                type:[Array,String],
                default:function(){
                    return [10, 20, 50, 100];
                }
            },
            //第几页
            page:{
                type:Number,
                default:1
            },
            //每页大小
            pageSize:{
                type:Number,
                default:10
            },
            //分页组件 布局
            layout:{
                type:String,
                default:"total, sizes, prev, pager, next, jumper"
            },
            //总记录条数
            totalItems:{
                type:Number,
                default:0
            },
            //分页的样式
            bbStyle:{
                type:[String,Object],
                default:function(){
                    return {
                        "marginTop":"20px",
                        "text-align": "right"
                    }
                }
            }
        },
        data() {
            return {
                p_pageSize:this.pageSize,
                p_page:this.page,
                p_totalItems:this.totalItems
            }
        },
        computed:{
            p_pageSizes(){
                return typeof(this.pageSizes)==='string'?JSON.parse(this.pageSizes):this.pageSizes;
            },
            p_style(){
                return Object.assign({
                        "marginTop":"20px",
                        "text-align": "right"
                    },(typeof(this.bbStyle)==='string'?JSON.parse(this.bbStyle):this.bbStyle));
            }
        },
        watch: {
            totalItems(val){
                this.p_totalItems = val;
            },
            pageSize(val){
                this.p_pageSize = val;
            },
            page(val){
                this.p_page = val;
            }
        },
        created: function () {
        },
        mounted:function(){
            let t=this;
            setTimeout(()=>{
                t.$emit('mounted',t);
            },0);
        },
        methods: {
            handleCurrentChange:function(_page){
                let t=this;
                t.p_page = _page;
                t.$emit("pageChange",t.p_page,t.p_pageSize,t);
                t.$emit("change",t.p_page,t.p_pageSize,t);
            },
            handleSizeChange:function(_pageSize){
                let t=this;
                t.p_pageSize = _pageSize;
                t.$emit("sizeChange",t.p_page,t.p_pageSize,t);
                t.$emit("change",t.p_page,t.p_pageSize,t);
            },
            //设置总记录条数  应该是外部事件触发的方法
            setTotal:function(...args){
                let t=this;
                if(args && args.length>0&&args[0]){
                    t.p_totalItems=args[0];
                }
            }
        }
    }
</script>