<template>
    <div>
        <span class="code_text">{{p_value}}</span>
        <el-button type="primary" class="m10" @click="openDialog">代码编辑</el-button>
        <el-dialog
              title="代码编辑"
              :visible.sync="dialogVisible"
              :width="dialogWidth"
              :modal="false"
              :fullscreen="fullscreen"
              :before-close="handleClose">
              <div ref="frameBox">
                    <el-button type="primary" @click="jsonFormat(true)">JSON格式化</el-button>
              </div>
              <!--   <iframe ref="childFrame" id="childFrame" width="100%" height="100%">
                </iframe> -->
              <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="formCommit">确 定</el-button>
              </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'bb-editor-code',
        components: {
        },
        props: {
            value:{
                type:[String,Object,Array]
            },
            returnObj:{
                type:Boolean,
                default:false
            }
        },
        data() {
            return {
                p_value:typeof(this.value)!='string'?JSON.stringify(this.value):this.value,
                dialogVisible:false,
                dialogWidth:'100%',
                fullscreen:true,
                codeObj : null
            }
        },
        watch: {
            value(val){
                var t = this;
                let temp = val;
                if(val && val instanceof Object&&t.returnObj){
                    temp = JSON.stringify(val);
                }
                t.p_value = temp;
                let frame = document.getElementById('childFrame_'+t.key);
                if(frame){
                    var childWindow = frame.contentWindow;
                    let editor = childWindow.editor;
                    editor.setValue(temp);
                }
            }
        },
        created: function () {
        },
        mounted: function () {
            var t =this;
        },
        methods: {
            //json格式化
            jsonFormat:function(showMessage){
                let t=this;
                let frame = document.getElementById('childFrame_'+t.key);
                if(frame.contentWindow.editor){
                    let editor = frame.contentWindow.editor;
                    //编辑器的值
                    let data = editor.getValue();
                    try{
                        //如果不能json转换，说明不是json格式
                        JSON.parse(data);
                    }catch(e){
                        if(showMessage){
                            t.$message({
                                type: 'info',
                                message: "数据非JSON格式或者JSON有错!"
                            });
                        }
                        return;
                    }
                    editor.setValue(_TY_Tool.jsonFormat(data));
                    const mode = 'application/ld+json';
                    editor.setOption("mode", mode);
                    editor.setOption("lineWrapping", true);
                    editor.setOption("autoCloseBrackets", true);
                }
            },
            //iframe添加css外链
            _addLink:function(doc,url) {
                var link = doc.createElement("link");
                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = url;
                var head = doc.getElementsByTagName("head")[0];
                head.appendChild(link);
            },
            //添加css 样式
            _addCss:function(doc) {
                let t=this;
                var style = doc.createElement("style");
                style.type = "text/css";
                var code =".CodeMirror {"+
                            "   border: 1px solid #eee;"+
                            "   height: 98%;"+
                            "   min-height: 360px;"+
                            "}"+
                            ".CodeMirror-scroll {"+
                            "   min-height: 360px;"+
                            "    height:100%;"+
                            "    overflow-y: hidden;"+
                            "    overflow-x: auto;"+
                            "}";
                try {
                    style.appendChild(doc.createTextNode(code));
                } catch (ex) {
                    style.text = code;
                }
                var head = doc.getElementsByTagName("head")[0];
                head.appendChild(style);
            },
            //添加js
            _addScript:function(doc,url) {
                var script = doc.createElement("script");
                script.type = "text/javascript";
                script.src = url;
                var head = doc.getElementsByTagName("head")[0];
                head.appendChild(script);
            },
            //添加iframe内容
            _addContent:function(doc,key){
                let t=this;
                var _div = doc.createElement("textarea");
                _div.id = "codeContent_"+key;
                doc.body.appendChild(_div);
                var script = doc.createElement("script");
                script.type = "text/javascript";
                var code ="window.editor = CodeMirror.fromTextArea(document.getElementById('codeContent_"+key+"'), {"+
                            "matchBrackets:true,"+
                            "mode: 'text/typescript',"+
                            "lineNumbers: true"+
                          "});\n"+
                            "function setEditorVal(data){window.editor.setValue(data);}";
                try {
                    script.appendChild(doc.createTextNode(code));
                } catch (ex) {
                    script.text = code;
                }
                doc.body.appendChild(script);
                setTimeout(function(){
                    let frame = document.getElementById('childFrame_'+t.key);
                    frame.contentWindow.setEditorVal(t.p_value);

                },300);
                setTimeout(()=>{
                    //如果能json格式化就显示格式化后的数据
                     t.jsonFormat();
                },600);
            },
            //打开弹窗
            openDialog:function(){
                let t=this;
                let opened = false;
                if(t.key){
                	opened = true;
                }else{
                	t.key = _TY_Tool.uuid(8);
                }
                t.dialogVisible = true;
                let _height="";
                if(t.fullscreen){
                    _height = "calc(100vh - 205px)";
                }
                setTimeout(function(){
                	if(!opened){
	                	let iframe = document.createElement("iframe");
		                iframe.id = "childFrame_"+t.key;
		                iframe.width="100%";
		                iframe.style['min-height']="380px";
                        iframe.style['height']=_height;
		                t.$refs['frameBox'].appendChild(iframe);
					}
                    let frame = document.getElementById('childFrame_'+t.key);
                    var childWindow = frame.contentWindow;
                    var childDoc = childWindow.document;
                    childDoc.body.innerHTML = '';
                 //    t._addLink(childDoc,"./../../node_modules/codemirror/lib/codemirror.css");
	                // t._addLink(childDoc,"./../../node_modules/codemirror/theme/eclipse.css");
	                // t._addScript(childDoc,"./../../node_modules/codemirror/lib/codemirror.js");

	                t._addLink(childDoc,"https://cdn.bootcss.com/codemirror/5.36.0/codemirror.min.css");
                    t._addScript(childDoc,"https://cdn.bootcss.com/codemirror/5.36.0/codemirror.min.js");
                    //主codemirror.js要先加载完成
                    setTimeout(function(){
                        t._addScript(childDoc,"https://cdn.bootcss.com/codemirror/5.36.0/addon/edit/matchbrackets.min.js");
                        t._addScript(childDoc,"https://cdn.bootcss.com/codemirror/5.36.0/addon/comment/continuecomment.min.js");
                         t._addScript(childDoc,"https://cdn.bootcss.com/codemirror/5.36.0/addon/comment/comment.min.js");
                        t._addScript(childDoc,"https://cdn.bootcss.com/codemirror/5.36.0/mode/javascript/javascript.min.js");
                        t._addCss(childDoc);
                    },200);
                    setTimeout(function(){
                        t._addContent(childDoc,t.key);
                    },1000);
                },0);
            },
            //关闭前的操作
            handleClose:function(){
                const t=this;
                t.dialogVisible =false;
            },
            formCommit:function(){
                let t=this;
                let frame = document.getElementById('childFrame_'+t.key);
                var childWindow = frame.contentWindow;
                let editor = childWindow.editor;
                let result = editor.getValue();
                t.p_value= result;
                if(t.returnObj && result){
                    try{
                    　　result = JSON.parse(result);
                    }catch(e){
                        try{
                            result = eval("("+result+")");
                        }catch(e1){
                            result = eval(result);
                        }
                    }
                }
                t.$emit("input",result);
                t.dialogVisible =false;
            }
        }
    }
</script>

<style scoped>
    .m10 {
        margin: 10px;
    }
    .code_text{
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100px;
        display: inline-block;
        vertical-align: middle;
    }
</style>