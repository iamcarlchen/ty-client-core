<template>
	<vant-progress
		:inactive="inactive"
		:percentage="percentageShow"
		:showPivot="showPivot"
		:color="color"
		:textColor="textColor"
		:pivotText="pivotText"
		:pivotColor="pivotColor"
	>
	</vant-progress>
</template>
<script>
	import Progress from 'vant/lib/progress'
	import 'vant/lib/progress/style';

	export default{
		name: "bb-vant-progress",
		components:{
			'vant-progress':Progress
		},
		props:{
			
			//是否置灰
		    inactive:{
		    	type:Boolean,
		    	default:false
		    },
		    //进度百分比
		    percentage:{
		    	type:Number,
		    	default:0
		    },
		    //是否显示进度文字
		    showPivot:{
		    	type:Boolean,
		    	default:false
		    },
		    //进度条颜色
		    color:{
		    	type:String,
		    	default:"#38f"
		    },
		    //进度条文字颜色
		    textColor:{
		    	type:String,
		    	default:"#fff"
		    },
		    //文字显示
		    pivotText:{
		    	type:String,
		    },
		    //文字背景色
		    pivotColor:{
		    	type:String,
		    }
		},
		data(){
			return {
				percentageShow:this.percentage,
			};
		},
	  	methods: {
	   		setTage:function(tage){
	   			this.percentageShow = tage
	   		}
	  	}
	}
</script>

