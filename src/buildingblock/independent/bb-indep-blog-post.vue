<template>
 	<div class="bb-indep-blog-post"> 
 		<div class="postMessage"> 
 			<textarea 
                value="valueBase.text"
 				:placeholder="placeholder"
                @change="textareaChange"
                class="words" 
 			> 
 			</textarea>
            <bb-layout-seriation-edit ref="postContent" class="h5configEdit" :horizontal="false" :content="realContent" :option="editOption" @remove="remove"></bb-layout-seriation-edit>
 			<span class="uploadIcon">
 				<i 
 				v-for="(icon,key) in realIcons" 
 				:class="icon.class"
                @click="addUpload(icon,key)"
                > 
 				</i>
 			</span>
            <bb-vant-cell-location class="loaction" @change="locationChange"></bb-vant-cell-location>
            <bb-vant-cell-picker class="privacy" :pickerConfig="pickerConfig" :option="privacyOption" v-model="privacy" @change="privacyChange"></bb-vant-cell-picker>
 		</div>
 	</div>
</template>

<script> 

export default {
    name:"bb-indep-blog-post",
    props:{
        /*日记编辑器的值  支持v-model
            {
                text:"", 文本框内容
                content:[]日记内容   content标准数据格式
                location:"",  地址名称
                privacy:"publicity"  "secret"
            }
        */ 
        value:{
            type:Object,
            default:function(){
                return {
                    text:"",
                    content:[],
                    location:"",
                    privacy:"publicity"
                }
            }
        },
        //输入框默认值
        placeholder:{
        	type:String,
        	default:"说点什么吧"
        },
        //图标数据
        icons:{
        	type:Array,
        	default:function(){
        		return[{
        			class:"ty ty-fbrj-pic",
                    alias:"image",
                    content:{
                        uuid: _TY_Tool.uuid(),
                        alias: 'bb-vant-uploader-image', //布局类积木 || 普通积木
                        transferAlias:'bb-photos',
                        aliasName: '添加图片', 
                        attributes: {
                            accept:"image/*",
                            transformConfig:{
                                transformMode:'list'
                            },
                            option:{
                                theme:"card",
                                defaultAdd:true
                            }
                        }, //积木属性
                        animation: [{ //动画
                        }],
                        interactives: [{
                            uuid:_TY_Tool.uuid(),
                            fromContentEvent:'input',
                            executeType:'container_method',         //执行类型(预定义方法 trigger_method,
                            containerMethodName:'defaultVmodel'
                        }],
                        layout: {} //积木布局
                    },
        		},{   
                    class:"ty ty-fbrj-shipin",
                    alias:"video",
                    content:{
                        uuid: _TY_Tool.uuid(),
                        alias: 'bb-vant-uploader', //布局类积木 || 普通积木
                        transferAlias:'bb-video',
                        aliasName: '添加视频', 
                        attributes: {
                            accept:"video/*",
                            option:{
                                theme:"card",
                                max:1,//最大上传个数
                                replace:true//超过最大上传后，是否替换
                            }
                        }, //积木属性
                        animation: [{ //动画
                        }],
                        interactives: [{
                            uuid:_TY_Tool.uuid(),
                            fromContentEvent:'input',
                            executeType:'container_method',         //执行类型(预定义方法 trigger_method,
                            containerMethodName:'defaultVmodel'
                        }],
                        layout: {} //积木布局
                    },
                },{   
                    class:"ty ty-fbrj-yinpin",
                    alias:"audio",
                    content:{
                        uuid: _TY_Tool.uuid(),
                        alias: 'bb-indep-uploader-audio', //布局类积木 || 普通积木
                        transferAlias:'bb-indep-audio-player',
                        aliasName: '添加音频', 
                        attributes: {
                            accept:"audio/*",
                        }, //积木属性
                        animation: [{ //动画
                        }],
                        interactives: [{
                            uuid:_TY_Tool.uuid(),
                            fromContentEvent:'input',
                            executeType:'container_method',         //执行类型(预定义方法 trigger_method,
                            containerMethodName:'defaultVmodel'
                        }],
                        layout: {} //积木布局
                    },
                }]
        	}
        },
        //列表数据
        items:{
        	type:Array,
        	default:function(){
        		return [{
        			text:"所在位置",
        			message:"公开",
        			rightIcon:"",
        			href:"",
        			leftIcon:"",
        		},{
        			text:"谁可以看",
        			message:"公开",
        			rightIcon:"",
        			href:"",
        			leftIcon:"",            		
        		}]
        	}
        },
        //其他属性设置
        option:{
            type:Object,
            default:function(){
            return {
                styleConfig:{
                fontFamily:'',
                fontSize:'14px',
                fontColor:'#9a9a9a',
                bold:false ,
                italic:false ,
                underline:false,
                textAlign:'left',
                lingHeight:1.5,
                letterSpacing:0,
                borderWidth:1,
                borderColor:"#eee",
                borderStyle:"solid",
                borderRadius:"2px",
                width:"95%",
                resize:"none",
                height:"100px",
                padding:"5%",
                margin:"0 2.5%",
                backgroundColor:"#eee",
            },
            canceclStyleCongig:{
                width:"50%",
                height:"40px",
                lineHeight:"40px",
                margin:"0",
                padding:"0",
                borderWidth:"1px",
                borderColor:"#eee",
                borderStyle:"solid",
                fontFamily:"",
                fontSize:"14px",
                fontStyle:"",
                fontWeight:"",
                color:"#666",
            },
            listLeftIconStyleConfig:{
                width:"20px",
                height:"20px",
                margin:"0",
                padding:"0"
            },
            //列表中间文字样式
            listTextStyleConfig:{
                width:"70%",
                height:"",
                lineHeight:"",
                maigin:"",
                padding:"",
                fontFamily:"",
                fontSize:"14px",
                color:"#000",
                fontStyle:"",
                fontWeight:"normal",
                display:"inline-block",
                textAlign:"left",
            },
            listMessageStyleConfig:{
                width:"20%",
                height:"",
                lineHeight:"",
                maigin:"",
                padding:"",
                fontFamily:"",
                fontSize:"14px",
                color:"#666",
                fontStyle:"",
                fontWeight:"normal",
                display:"inline-block",
                textAlign:"right",
            },
            //列表右侧图标样式
            listRightIconStyleConfig:{
                width:"20px",
                height:"20px",
                margin:"0",
                padding:"0"        
            },
            //图标样式
            iconStyleConfig:{
                width:"25px",
                height:"25px",
                margin:"0 10px 0 0",
                padding:"0",
            },
        }}
        }
    },

   data(){ 
        return{
            valueBase:this.value,
            privacyOption:{
                icon:"ty ty-wo",
                title:"谁可以看",
                required:false,
                isLink:true,
                center:false,
                clickable:true
            },
            privacy:this.value.privacy,
            location:this.value.location,
            realContent:this.value.content,
            privacyPicker:false,
            pickerConfig:{
                showToolbar:true,
                title:"隐私设置",
                columns:[{
                    text:"公开 其他成员可以见",
                    value:"publicity"
                },{
                    text:"私密 仅自己可见",
                    value:"privacy",
                }]
            },
            editOption:{
                styleType:"swpie"
            },
            realIcons:_TY_Tool.deepClone(this.icons)
        }
      },
    computed:{
        //按钮样式
        canceclStyle:function(){
            const t = this;
            const styles = {
            	"width":t.option.canceclStyleCongig.width,
            	"height":t.option.canceclStyleCongig.height,
            	"ling-height":t.option.canceclStyleCongig.lineHeight,
            	"margin":t.option.canceclStyleCongig.margin,
            	"padding":t.option.canceclStyleCongig.padding,
            	"border-width":t.option.canceclStyleCongig.borderWidth,
            	"border-color":t.option.canceclStyleCongig.borderColor,
            	"border-style":t.option.canceclStyleCongig.borderStyle,
            	"font-family":t.option.canceclStyleCongig.fontFamily,
            	"font-size":t.option.canceclStyleCongig.fontSize,
            	"font-style":t.option.canceclStyleCongig.fontStyle,
            	"font-weight":t.option.canceclStyleCongig.fontWeight,
            	"color":t.option.canceclStyleCongig.color,
            }
            return styles;
        },
        //列表左侧图标样式
        listLeftIconStyle:function(){
            const t = this;
            const styles = {
            	"width":t.option.listLeftIconStyleConfig.width,
            	"height":t.option.listLeftIconStyleConfig.height,
            	"margin":t.option.listLeftIconStyleConfig.margin,
            	"padding":t.option.listLeftIconStyleConfig.padding,
            }
            return styles;        
        },
        //列表文字样式
        listTextStyle:function(){
            const t = this;
            const styles = {
            	"width":t.option.listTextStyleConfig.width,
            	"height":t.option.listTextStyleConfig.height,
            	"display":t.option.listTextStyleConfig.display,
            	"line-height":t.option.listTextStyleConfig.lineHeight,
            	"margin":t.option.listTextStyleConfig.margin,
            	"padding":t.option.listTextStyleConfig.padding,
            	"font-family":t.option.listTextStyleConfig.fontFamily,
            	"font-size":t.option.listTextStyleConfig.fontSize,
            	"color":t.option.listTextStyleConfig.color,
            	"font-style":t.option.listTextStyleConfig.fontStyle,
            	"font-weight":t.option.listTextStyleConfig.fontWeight,         	
            	"text-align":t.option.listTextStyleConfig.textAlign,         	
            }
            return styles;        
        },
        //列表中提示信息文字样式
        listMessageStyle:function(){
            const t = this;
            const styles = {
            	"width":t.option.listMessageStyleConfig.width,
            	"height":t.option.listMessageStyleConfig.height,
            	"display":t.option.listMessageStyleConfig.display,
            	"line-height":t.option.listMessageStyleConfig.lineHeight,
            	"margin":t.option.listMessageStyleConfig.margin,
            	"padding":t.option.listMessageStyleConfig.padding,
            	"font-family":t.option.listMessageStyleConfig.fontFamily,
            	"font-size":t.option.listMessageStyleConfig.fontSize,
            	"color":t.option.listMessageStyleConfig.color,
            	"font-style":t.option.listMessageStyleConfig.fontStyle,
            	"font-weight":t.option.listMessageStyleConfig.fontWeight, 
            	"text-align":t.option.listMessageStyleConfig.textAlign,         	

            }
            return styles;        
        },    
        //列表中提示信息文字样式
        listRightIconStyle:function(){
            const t = this;
            const styles = {
            	"width":t.option.listRightIconStyleConfig.width,
            	"height":t.option.listRightIconStyleConfig.height,
            	"margin":t.option.listRightIconStyleConfig.margin,
            	"padding":t.option.listRightIconStyleConfig.padding,

            }
            return styles;        
        },   
    },
    created(){

    },
    watch:{},
    methods:{
        loadChildBB(){
            let t=this;
            return _TY_Tool.loadChildBB(t);                
        },
        showPicker(){
            this.privacyPicker = true;
        },
        addUpload(icon,key){
            const content = _TY_Tool.deepClone(icon.content);
            content.uuid = _TY_Tool.uuid();
            this.realContent.push(content);
            this.realIcons.splice(key,1);
        },
        textareaChange(e){
            this.valueBase.text = e.target.value;
            this.valueBase.content = this.$refs.postContent.getContents();
            this.$emit("change",this.valueBase);
            this.$emit("input",this.valueBase);
        },
        //外部获取最新的content
        getContents(){
            this.valueBase.content = this.$refs.postContent.getContents();
            this.$emit("change",this.valueBase);
            this.$emit("input",this.valueBase);
            return this.valueBase;
        },
        privacyChange(value){
            this.privacy = value;
            this.valueBase.privacy = value;
            this.valueBase.content = this.$refs.postContent.getContents();
            this.$emit("change",this.valueBase);
            this.$emit("input",this.valueBase);
        },
        locationChange(value){
            this.valueBase.location = value;
            this.valueBase.content = this.$refs.postContent.getContents();
            this.$emit("change",this.valueBase);
            this.$emit("input",this.valueBase);
        },
        //删除处理
        remove(param){
            const t = this;
            const alias = param.alias;
            t.icons.forEach((item,key)=>{
                if(item.content.alias == alias){
                    t.realIcons.splice(key,0,item);
                }
            })
        }
    }
}
</script>
<style lang="less">
    .bb-indep-blog-post{
        .postMessage{
            width:100%;
            background:#fff;
        }
        .listStyle{
            width:80%;
            height:auto;
            line-height:40px;
            display:flex;
            justify-content:center;
            border-top:1px solid #eee;
            border-bottom:1px solid #eee;
            display:inline-block;
            margin:0 10%;
        }
        .listStyle:nth-child(even){
            border-top:none;
        }
        .buttonList{
            width:100%;
            position:fixed;
            bottom:0;
            left:0;
            display:flex;
            justify-content:center;
        }
        .uploadIcon{
            font-size: 1rem;
            color: #7C808F;
            line-height: 1rem;
            margin-bottom:1.76rem;
            margin-left:0.3rem;
            display: inline-block;
            i{
                margin:0.3rem .1rem;
            }
        }
        .h5configEdit{
        }
        .words{
            background-color:#FAF9FA;
            border:1px solid #EFEFEF;
            height:3.68rem;
            width:9.4rem;
            margin:auto;
            margin-bottom: 0.1rem;
            padding:0.5rem;
            display:block;
            font-size:0.37rem;
            color:#8C8B8B;
            font-family:PingFang-SC-Medium;
            font-weight:Medium;
        }
        .privacy{
            i{
                line-height:0.6rem;
            }
            .van-cell__value{
                color:#888888
            }
        }
        .cellPicker{
            border:1px solid #F4F4F4;
            border-left:none;
            border-right:none;
            margin:0 0.2rem;
        }
    }
</style>