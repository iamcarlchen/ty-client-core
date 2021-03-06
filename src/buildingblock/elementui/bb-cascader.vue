<template>
    <div>
      <el-cascader
        :placeholder="placeholder"
        :options="optionData"
        :filterable="filterable"
        :change-on-select="changeOnSelect"
        :show-all-levels="showAllLevels"
        :disabled="option.disabled"
        :size="option.size"
        @active-item-change="handleItemChange"
        @change="handleChange"
        :props="p_casProps"
        v-model="selectedOptions"
        ref='cas'
        :title="cascaderTitle"
      ></el-cascader>
    </div>
</template>

<script>
    export default {
        name: 'bb-cascader',
        props: {
          value:{
            type:[Number,String,Array,Object]
          },
          placeholder:{
              type:String,
              default:'请选择'
          },
          //是否可以选择任意一级
          changeOnSelect:{
            type:Boolean,
            default:false
          },
          //是否支持第一级搜索
          filterable:{
            type:Boolean,
            default:false
          },
          //是否显示完整路径
          showAllLevels:{
            type:Boolean,
            default:true
          },
          /**
           静态选项  用json来控制比较好点
            [{
              value: 'zhinan',
              label: '指南',
              children: [{
                value: 'shejiyuanze',
                label: '设计原则',
                children:[]
              }]
            }]
           **/
          staticOptions:{
            type:[String,Array],
            default:"[]"
          },
          /**
              {
                value: 'value',
                label: 'label',
                children: 'children'
              }
          **/
          casProps:{
            type:Object,
            default:function(){
              return {
                value: 'value',
                label: 'label',
                children: 'children'
              };
            }
          },
          /**
            dsList级联数据获取方式，ds表示通过接口获取; method表示通过容器方法获取
            dsList:[{
              type:'ds',                            //级联数据获取方式  接口获取
              index:1,                              //级联第几层接口，比如第一层数据的获取接口   
              isleaf:false,                       //是否叶子节点
              ds:{                                //ds配置
                "api": "xxx",
                "category": "config",
                "method": "get",
                "inputs": [{
                    "paramName": "id",
                    "valueType": "inputValueObj",
                    "valueKey": "row-data",
                    "variable": "id"
                }],
                "outputs": [{
                    "dataKey": "formData",
                    "valueKey": "data"
                }]
              },
              props:{                               //方法返回字段和级联选择器的字段对应（字段名转换）
                value:'uuid',
                label:'name',
                children:'children'
              }
            },{
              type:'method',                        //级联数据获取方式  接口获取
              index:2,                              //级联第几层接口，比如第一层数据的获取接口   -1表示无限级联
             // uuid:'xxx',                         //需要执行方法的积木uuid  根据uuid获取vue对象，然后调用方法，
              isleaf:false,                       //是否叶子节点
              method:'loadChildBB',                //获取数据的方法名
              props:{                               //方法返回字段和级联选择器的字段对应（字段名转换）
                value:'uuid',
                label:'name',
                children:'children'
              }
            }]
          **/
          dsList:{
            type:Array,
            default:function(){
              return [];
            }
          },
          valueTpl:{
            type:String,
            default:function(){
              return '';
            }
          },
          //基础配置
          option:{
              type:Object,
              default:function(){
                  return {
                      disabled:false,
                      size:""
                  };
              }
          }
        },
        data() {
            return {
                optionData:(typeof(this.staticOptions)==='string'?JSON.parse(this.staticOptions):this.staticOptions||[]),
                selectedOptions:[],
                itemVal:'',//当前点击的记录    用于接口配置
                external:{},//外部参数
                p_placeholder:this.placeholder,
                cascaderTitle:""//需要title显示的内容，针对长度过程隐藏后需要能全部显示
            }
        },
        computed:{
          p_casProps:function(){
            return Object.assign({
                value: 'value',
                label: 'label',
                children: 'children'
              },this.casProps)
          }
        },
        watch:{
          staticOptions(val){
            this.optionData = typeof(val)==='string'?JSON.parse(val):val||[]
          }
        },
        created: function () {
          let t=this;
          if(t.dsList&&t.dsList.length>0){
            //有动态请求数据的配置  第一级
            t.getNextData(1);
            setTimeout(function(){
              t.loadValue(t.value);
            },300);
          }
        },
        mounted:function(){
        },
        methods: {
          setCascaderTitle:function(){
            let t=this;
            if(!this.$refs['cas']){
              t.cascaderTitle = "";
            }
            let currentLabels = this.$refs['cas'].currentLabels;
            if(currentLabels&&currentLabels.length>0){
              t.cascaderTitle = currentLabels.join("/");
            }else{
              t.cascaderTitle = "";
            }
          },
            loadValue:function(val){
              let t=this;
              if(!val){
                 t.setCascaderTitle();
                return;
              }
              let vals=val;
              if(typeof(val)==='string'){
                vals = val.split(",");
              }else if(typeof(val)==='number'){
                vals = [val];
              }
              t.selectedOptions = vals;
              vals.forEach(function(_item,_index){
                  if(_index<vals.length-1){
                    setTimeout(function(){
                      t.getNextData(_index+2,_item,vals.slice(0,_index+1));
                    },300);
                  }
              });
              setTimeout(()=>{
                t.setCascaderTitle();
              },1000);
            },
            linkage:function(...data){
              let t=this;
              if(data){
                this.external['linkage'] = data;
                //刷新选项
                t.getNextData(1);
              }
            },
            //单级选项改变后触发, 远程获取下级数据
            handleItemChange:function(value){
              // console.log('active item:', value);
              let t=this;
              const index = value.length+1;
              let param  = value.length>0?value[value.length-1]:'';//取级联选择的最后那个值
              // 只有changeOnSelect 为false时，handleItemChange 才会起作用，参考级联选择器属性注释
              if(!t.changeOnSelect&&t.dsList&&t.dsList.length>0){
                //有动态请求数据的配置
                t.getNextData(index,param,value);
              }
            },
            //选项改变后触发事件
            handleChange:function(value){
              // console.log('active:', value);
              let t=this;
              const index = value.length+1;
              let param  = value.length>0?value[value.length-1]:'';//取级联选择的最后那个值
              if(t.changeOnSelect&&t.dsList&&t.dsList.length>0&&!t._isLeaf(value)){
                  //有动态请求数据的配置    不是叶子节点则调用
                  t.getNextData(index,param,value);
              }
              let resultVal = value;
              if(t.valueTpl){
                resultVal=_TY_Tool.tpl(t.valueTpl,{value:value});//不需要传其他的参数
                //向上提供change事件
                t.$emit('change',resultVal,t);//把级联选择的当前对象传过去，调用bb-page的excuteDs方法时，需要linkage参数
                t.$emit('input',resultVal,t);
              }else{
                const lastVal = value[value.length-1];
                //t._tempItem 临时item
                t._tempItem='';
                t._findItem(lastVal,t.optionData);
                t.$emit('change',t._tempItem,t);
                t.$emit('input',t._tempItem,t);
              }
            },
            _findItem:function(val,list){
              let t=this;
              if(t._tempItem){
                return;
              }
              for(let i=0;i<list.length;i++){
                let item = list[i];
                if(val==item[t.casProps.value]){
                  t._tempItem = item;
                  return;
                }else if(item.children&&item.children.length>0){
                  let result = t._findItem(val,item.children);
                  if(result){
                    t._tempItem = item;
                    return;
                  }
                }
              }
            },
            //判断是否选中叶子节点
            _isLeaf:function(value){
              let t=this;
              if(value&&value.length>0){
                const lastVal = value[value.length-1];//最后一个选择项的val值
                let tempVal=t.optionData;
                for(let i=0;i< value.length;i++){
                  for(let j=0;j<tempVal.length;j++){
                    if(value[i]==tempVal[j][t.p_casProps.value]){
                        //找到那一级
                        if(tempVal[j]&&!tempVal[j][t.p_casProps.children]){
                          //没有children属性，表示为叶子节点
                          tempVal = null;
                        }else{
                          tempVal = tempVal[j][t.p_casProps.children];
                        }
                        break;
                    }
                  }
                }
                if(tempVal==null){
                    return true;
                }
              }
              return false;
            },
            //获取下一级数据，动态获取下一级数据时有效
            getNextData:function(index,lastSelectedVal,selectedValArray){
               let t=this;
               t.itemVal = lastSelectedVal;
               if(t.dsList&&t.dsList.length>0){
                  for(let i=0;i<t.dsList.length;i++){
                    let item = t.dsList[i];
                    if(!item.index){
                      console.log('item index is null');
                      item.index=1;//默认为第一级
                    }
                    //index为-1表示无限级联
                    if((item.index&&item.index==index)||item.index==-1){
                        //有这一级数据来源配置
                        t._excuteNextOpt(item,lastSelectedVal,selectedValArray);
                        break;
                    }
                  }
               }
            },
            //获取下一级数据 lastSelectedVal 为当前级选项值   selectedValArray 选择的全部选项 array
            _excuteNextOpt:function(item,lastSelectedVal,selectedValArray){
              let t=this;
              const type = item.type;
              if(type=='ds'){
                //接口获取
                _TY_Tool.getDSData(item.ds, _TY_Tool.buildTplParams(t), function (map) {
                        map.forEach((mapItem, key)=> {
                           t.__fillNextOptions(item,mapItem.value,selectedValArray);
                           return;   //只有一层
                        });
                    }, function (code, msg) {
                    });
              }else if(type=='method'){
                //方法获取
                let method = item.method;
                let uuidVueObj = _TY_Tool.findBBByUuid(lastSelectedVal);//直接从根路径去找这个uuid
                let list =[];
                if(uuidVueObj&&uuidVueObj!=null){
                    list = uuidVueObj[method]();
                }
                //填充下一级数据
                t.__fillNextOptions(item,list,selectedValArray);
              }else{
                //目前没有涉及到
              }
            },
            //填充到下一级数组
            __fillNextOptions:function(item,list,selectedValArray){
              let t=this;
              //需要改动的options下标值
              const index = item.index-1;
              const props = item.props;
              const isleaf = item.isleaf;
              let result = [];
              if(list&&list.length>0){
                list.forEach(function(data,i){
                  let temp={};
                  if(props){
                    //有属性字段转换配置
                    if(props.value){
                      temp[t.p_casProps.value]=data[props.value];
                    }
                    if(props.label){
                      temp[t.p_casProps.label]=data[props.label];
                    }
                    if(data.hasOwnProperty('isleaf')&&data['isleaf']){
                        //如果含有isLeaf字段，并且为true 就不存children属性,没有children属性，表示是叶子节点
                    }else if((props.children&&data[props.children])||!isleaf||(data.hasOwnProperty('isleaf')&&!data['isleaf'])){
                      //如果有  并且不是叶子节点
                      temp[t.p_casProps.children]=[];
                    }
                  }else{
                    if(!isleaf||(data.hasOwnProperty('isleaf')&&!data['isleaf'])){
                      temp[t.p_casProps.children]=[];
                    }
                  }
                  result.push(Object.assign({},data,temp));
                });
              }
              if(t.optionData&&t.optionData.length>=0){
                if(index==0){
                  //表示根
                  t.optionData=result;
                }else{
                  if(selectedValArray&&selectedValArray.length>0){
                    let resultOptionItem;
                    let dataTemp = t.optionData;
                    for(let i=0;i<selectedValArray.length;i++){
                        for(let j=0;j<dataTemp.length;j++){
                          if(selectedValArray[i]==dataTemp[j][t.p_casProps.value]){
                            //找到了  
                            resultOptionItem=dataTemp[j];
                            if(i!=selectedValArray.length-1&&dataTemp[j][t.p_casProps.children]&&dataTemp[j][t.p_casProps.children].length>0){
                              dataTemp=dataTemp[j][t.p_casProps.children];
                            }
                            break;
                          }
                        }
                    }
                    if(resultOptionItem){
                      resultOptionItem[t.p_casProps.children]=result;
                    }
                  }
                }
              }
            }

        }
    }
</script>
<style scoped>
    
</style>