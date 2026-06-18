const DEITY = {
  青龙:{tone:'正向',symbol:'喜庆、贵人、正财、名誉',use:'宜走正道、求助长辈或正式渠道。'},
  玄武:{tone:'隐伏',symbol:'暗线、隐情、拖延、试探',use:'宜查证信息，不宜只听口头说法。'},
  朱雀:{tone:'信息',symbol:'消息、表达、文书、传播',use:'宜主动沟通、留存记录、重视文字表达。'},
  白虎:{tone:'冲突',symbol:'争执、压力、损耗、强硬人物',use:'宜降温避锋，少争辩，多凭证据。'},
  六合:{tone:'和合',symbol:'合作、人情、媒介、调解',use:'宜借力第三方，以柔性方式推进。'},
  勾陈:{tone:'阻滞',symbol:'牵连、旧事、现实阻碍、沉重负担',use:'宜先处理卡点，减少沉没成本。'}
};
const PERSONA = {
  wealth:{青龙:'可靠客户、正财贵人或稳定资源方。',玄武:'信息不透明的人，可能观望或拖款。',朱雀:'销售、谈判者、传递消息的人。',白虎:'强势竞争者或议价压迫方。',六合:'合作伙伴、熟人介绍、渠道资源。',勾陈:'流程卡点、审批方、旧账相关人。'},
  love:{青龙:'态度正派、重稳定与承诺。',玄武:'心思不明、试探较多、可能保留。',朱雀:'表达欲强，易因话语推进或误会。',白虎:'情绪强、好胜或容易争执。',六合:'愿意相处、重和气与陪伴。',勾陈:'顾虑现实、旧问题或责任压力。'},
  career:{青龙:'上级贵人、正向机会、正式认可。',玄武:'背后信息、隐性流程或暗中竞争。',朱雀:'汇报、面试、文书与表达环节。',白虎:'压力来源、强势主管或竞争者。',六合:'团队、同事、合作部门。',勾陈:'制度、流程、历史包袱。'},
  travel:{青龙:'安全顺行，有贵人或好安排。',玄武:'路线不明、延误或暗中变化。',朱雀:'票据、通知、导航信息。',白虎:'交通冲突、检查、突发不快。',六合:'同行者、接应人、朋友帮助。',勾陈:'行李、手续、地点卡点。'},
  health:{青龙:'状态偏稳，适合规律调整。',玄武:'状态不明，宜观察与确认。',朱雀:'信息反馈快，适合记录变化。',白虎:'压力偏急，宜减少消耗。',六合:'配合调养、身边支持有帮助。',勾陈:'慢性负担或长期习惯影响。'},
  lost:{青龙:'物在正当、整洁、常用位置。',玄武:'物在暗处、水边、遮挡处。',朱雀:'与手机、票据、书信、消息有关。',白虎:'近金属、车边、路口或被移动。',六合:'可问朋友、同事、同行者。',勾陈:'在杂物、柜底、角落、堆放处。'},
  lawsuit:{青龙:'正式材料、正当渠道较有利。',玄武:'隐情、证据缺口或信息不明。',朱雀:'沟通、文书、措辞是关键。',白虎:'对抗强，容易升级。',六合:'协商、调解空间仍在。',勾陈:'流程拖延、旧问题牵连。'}
};
const SPEED = {快速:2,'急而冲':2,渐进:1,'慢而稳':0,'迟缓反复':-1,'虚而停':-2};

export function buildDeityInsight(first,middle,final,category){
  return [first,middle,final].map((g,i)=>({
    stage:['起因','经过','结果'][i], palace:g.name, deity:g.deity,
    tone:DEITY[g.deity].tone, symbol:DEITY[g.deity].symbol,
    text:`【${g.deity}】主${DEITY[g.deity].symbol}；在${['起因','经过','结果'][i]}位，表示${PERSONA[category]?.[g.deity] || DEITY[g.deity].use}`
  }));
}
export function buildTimingInsight(first,middle,final,score,wuxing){
  const raw=(SPEED[final.speed]??0)+(SPEED[middle.speed]??0)*0.5+(score>=4?0.5:score<=2?-0.5:0)+(wuxing.processToResult.rel==='sheng'?0.5:0)+(wuxing.processToResult.rel==='ke'?-0.5:0);
  const pace=raw>=1.5?'偏快':raw<=-1?'偏慢':'中速';
  const window=pace==='偏快'?final.timing.fast:pace==='偏慢'?final.timing.slow:`${final.timing.fast}至${final.timing.slow}`;
  return {pace,window,basis:`以最终宫【${final.name}】的${final.speed}为主，参考经过宫【${middle.name}】及过程到结果的五行关系。`};
}
export function buildPersonaInsight(first,middle,final,category){
  const f=PERSONA[category]?.[final.deity] || DEITY[final.deity].use;
  const m=PERSONA[category]?.[middle.deity] || DEITY[middle.deity].use;
  return {main:`结果位【${final.name}·${final.deity}】：${f}`, process:`过程位【${middle.name}·${middle.deity}】：${m}`, tendency:`整体人物倾向为“${final.keywords.slice(0,2).join('、')}”，互动上宜按【${final.deity}】之象处理。`};
}
export function buildLocationInsight(final,category){
  const categoryHint={wealth:'财务资料、付款渠道、交易记录附近',love:'常联系地点、社交软件、共同活动场景',career:'办公区、文件系统、会议沟通场景',travel:'票据、导航、行李、交通节点',health:'作息、饮食、休息环境',lost:'最后使用处、收纳处、遮挡处',lawsuit:'合同、聊天记录、邮件、材料归档处'};
  return {direction:final.position, places:final.image.place, objects:final.image.object, hint:categoryHint[category]||'与当前所问事项直接相关的现实场景'};
}
export function buildAdvancedInsights({first,middle,final,category,score,wuxing}){
  return {deity:buildDeityInsight(first,middle,final,category),timing:buildTimingInsight(first,middle,final,score,wuxing),persona:buildPersonaInsight(first,middle,final,category),location:buildLocationInsight(final,category)};
}
