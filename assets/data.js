/* ============ 默认数据（可被 localStorage 覆盖） ============ */

const DEFAULT_PLANS = {
  A: {
    title: '🏆 A · 经典山海 + 萌宠古镇',
    tag: '山、海、萌宠、古镇、淮扬菜一次全要',
    day1: {
      date: '5.3 周日 · 连云港',
      subtitle: '上山看猴，下海吃虾',
      items: [
        { id:'a11', time: '07:30', act: '酒店早餐 + 大件寄存前台', note: '带一个随身小包即可' },
        { id:'a12', time: '08:00', act: '打车赴花果山南天门', note: '约 20 分钟，¥25' },
        { id:'a13', time: '08:30–13:00', act: '花果山：三元宫 → 水帘洞 → 玉女峰', note: '门票 90 + 索道 70，可省体力' },
        { id:'a14', time: '13:00–14:00', act: '山下农家乐午餐', note: '推荐"花果山土菜馆"，人均 ¥60' },
        { id:'a15', time: '14:00–15:00', act: '打车赴连岛苏马湾', note: '约 50 分钟，¥80' },
        { id:'a16', time: '15:00–17:30', act: '连岛苏马湾：海滨浴场 → 日落', note: '门票 50' },
        { id:'a17', time: '17:30–19:00', act: '海鲜晚餐：渔村第一鲜', note: '人均 ¥150' },
        { id:'a18', time: '19:00–19:30', act: '回酒店取行李，到连云港站', note: '¥60' },
        { id:'a19', time: '20:00–21:30', act: '🚄 高铁赴淮安东', note: '推荐 20:30 前后，25–60 分钟' },
        { id:'a110', time: '22:30 前', act: '打车到河下古镇酒店入住', note: '¥40' }
      ]
    },
    day2: {
      date: '5.4 周一 · 淮安',
      subtitle: '古镇晨逛 + 白马湖撸猫',
      items: [
        { id:'a21', time: '08:00–08:30', act: '古镇早点（胡辣汤、茶馓）', note: '步行' },
        { id:'a22', time: '08:30–11:00', act: '河下古镇晨逛：石板街 → 吴承恩故居 → 文楼', note: '古镇免费，故居 30 元' },
        { id:'a23', time: '11:00–11:30', act: '退房寄存行李', note: '步行' },
        { id:'a24', time: '11:30–12:30', act: '打车赴白马湖三岛码头', note: '约 40 分钟，¥50' },
        { id:'a25', time: '12:30–16:00', act: '三岛奇遇记：肥猫岛 → 鸸鹋岛 → 白马岛', note: '门票 ¥120，含船票' },
        { id:'a26', time: '16:00–17:00', act: '打车回河下古镇取行李', note: '¥50' },
        { id:'a27', time: '17:00–18:30', act: '晚餐：清溪楼·淮扬菜', note: '蒲菜肉圆 + 软兜长鱼，人均 ¥79' },
        { id:'a28', time: '18:30–19:15', act: '打车赴淮安东站', note: '¥30，20 分钟' },
        { id:'a29', time: '19:30 起', act: '🚄 淮安东站候车', note: '建议车次 ≥ 20:00' }
      ]
    }
  },
  B: {
    title: '🏆 B · 轻松海景 + 水族 + 古镇',
    tag: '不爬山、不晒太久，拍照最出片',
    day1: {
      date: '5.3 周日 · 连云港',
      subtitle: '海滨公路慢节奏',
      items: [
        { id:'b11', time: '09:30–10:30', act: '睡到自然醒，早午餐', note: '—' },
        { id:'b12', time: '10:30–11:00', act: '打车赴在中路', note: '¥40' },
        { id:'b13', time: '11:00–12:30', act: '在中路打卡：椰林段 + 海景弯道', note: '免费' },
        { id:'b14', time: '12:30–14:00', act: '连岛入口海鲜午餐', note: '人均 ¥120' },
        { id:'b15', time: '14:00–17:30', act: '连岛：大沙湾 + 苏马湾 + 栈道日落', note: '门票 50' },
        { id:'b16', time: '17:30–19:00', act: '晚餐：渔村第一鲜', note: '人均 ¥150' },
        { id:'b17', time: '19:00–20:00', act: '回酒店取行李，连云港站', note: '¥60' },
        { id:'b18', time: '20:30–21:30', act: '🚄 高铁赴淮安东', note: '25–60 分钟' },
        { id:'b19', time: '22:30 前', act: '打车到河下古镇酒店', note: '¥40' }
      ]
    },
    day2: {
      date: '5.4 周一 · 淮安',
      subtitle: '龙宫海洋世界一整天',
      items: [
        { id:'b21', time: '08:30', act: '退房寄存，打车赴龙宫', note: '¥20' },
        { id:'b22', time: '09:00', act: '入园（门票约 ¥220）', note: '含海洋馆 + 嬉水世界' },
        { id:'b23', time: '09:00–12:00', act: '海底隧道 → 白鲸表演 → 企鹅馆', note: '拿当日表演时刻表' },
        { id:'b24', time: '12:00–13:00', act: '园内简餐', note: '人均 ¥80' },
        { id:'b25', time: '13:00–16:30', act: '美人鱼 → 动物巡游 → 嬉水世界', note: '5 月水温凉，量力而行' },
        { id:'b26', time: '17:00', act: '打车回河下古镇', note: '¥25' },
        { id:'b27', time: '17:30–19:00', act: '晚餐：文楼（汤包发源地）', note: '人均 ¥60' },
        { id:'b28', time: '19:00–19:30', act: '取行李，赴淮安东站', note: '¥30' },
        { id:'b29', time: '20:00 起', act: '🚄 候车', note: '—' }
      ]
    }
  },
  C: {
    title: '📋 C · 西游深度主题',
    tag: '一天一个大景点，玩到透',
    day1: {
      date: '5.3 连云港 · 花果山整天',
      subtitle: '',
      items: [
        { id:'c11', time: '08:00–16:30', act: '花果山深度：三元宫 → 水帘洞 → 玉女峰 → 海天洞', note: '门票 90 + 索道 70' },
        { id:'c12', time: '17:00–18:30', act: '山下晚餐（海鲜或农家乐）', note: '人均 ¥80' },
        { id:'c13', time: '19:00–19:30', act: '回酒店取行李到连云港站', note: '¥60' },
        { id:'c14', time: '19:30–21:00', act: '🚄 高铁赴淮安东', note: '—' }
      ]
    },
    day2: {
      date: '5.4 淮安 · 龙宫海洋世界整天',
      subtitle: '',
      items: [
        { id:'c21', time: '09:00–17:30', act: '龙宫大白鲸全畅玩：海洋馆 + 嬉水 + 表演 + 巡游', note: '门票 ¥220' },
        { id:'c22', time: '18:00–19:00', act: '打车回古镇晚餐（清溪楼）', note: '人均 ¥79' },
        { id:'c23', time: '19:30 起', act: '🚄 淮安东站候车', note: '—' }
      ]
    }
  },
  D: {
    title: '📋 D · 古城文化 + 运河夜游',
    tag: '强度低、文化浓，晚上有夜游船',
    day1: {
      date: '5.3 连云港 · 半日山 + 半日海',
      subtitle: '',
      items: [
        { id:'d11', time: '08:00–13:30', act: '花果山精华：三元宫 + 水帘洞 + 索道玉女峰', note: '门票 90 + 索道 70' },
        { id:'d12', time: '14:00–14:30', act: '打车赴连岛', note: '¥80' },
        { id:'d13', time: '15:00–18:30', act: '连岛看海 + 日落', note: '门票 50' },
        { id:'d14', time: '18:30–19:30', act: '海鲜晚餐', note: '¥150' },
        { id:'d15', time: '20:00–21:00', act: '🚄 高铁赴淮安东', note: '—' }
      ]
    },
    day2: {
      date: '5.4 淮安 · 伟人故居 + 夜游船',
      subtitle: '',
      items: [
        { id:'d21', time: '09:00–11:30', act: '周恩来故里：故居 + 纪念馆', note: '免费凭身份证' },
        { id:'d22', time: '12:00–13:30', act: '市区淮扬菜午餐（长鱼世家）', note: '¥100' },
        { id:'d23', time: '14:00–17:00', act: '河下古镇慢逛：茶馓 + 文楼汤包', note: '—' },
        { id:'d24', time: '17:00–18:00', act: '取行李赴清江浦景区', note: '¥25' },
        { id:'d25', time: '18:30–20:00', act: '🚤 里运河夜游船', note: '船票约 ¥80' },
        { id:'d26', time: '20:30 起', act: '打车赴淮安东站', note: '¥30' }
      ]
    }
  },
  E: {
    title: '📋 E · 原计划修正版',
    tag: '保留原意向，舍弃金湖（距离不可行）',
    day1: {
      date: '5.3 连云港（同方案 A）',
      subtitle: '',
      items: [
        { id:'e11', time: '参见', act: '主推方案 A 的 5.3 时间表', note: '花果山 + 连岛 + 海鲜晚餐 + 高铁赴淮' }
      ]
    },
    day2: {
      date: '5.4 龙宫上午 + 肥猫岛下午',
      subtitle: '节奏偏紧，每段都精简',
      items: [
        { id:'e21', time: '08:30–09:00', act: '退房寄存，打车赴龙宫', note: '¥20' },
        { id:'e22', time: '09:00–13:00', act: '龙宫精简：海底隧道 + 白鲸 + 美人鱼', note: '门票 ¥220' },
        { id:'e23', time: '13:00–13:30', act: '园内快餐或外带', note: '—' },
        { id:'e24', time: '13:30–14:15', act: '打车赴白马湖三岛码头', note: '约 45 分钟，¥70' },
        { id:'e25', time: '14:30–16:30', act: '三岛奇遇记（以肥猫岛为主）', note: '门票 ¥120' },
        { id:'e26', time: '16:30–17:30', act: '回河下古镇取行李', note: '¥50' },
        { id:'e27', time: '17:30–18:30', act: '古镇快速晚餐（文楼汤包）', note: '¥60' },
        { id:'e28', time: '18:30–19:00', act: '打车赴淮安东站', note: '¥30' },
        { id:'e29', time: '19:30 起', act: '🚄 候车', note: '车次 ≥ 20:30' }
      ]
    }
  }
};

/* TodoList 按分组组织，每个分组可独立增删改 */
const DEFAULT_TODOS = {
  groups: [
    { id: 'g_pre', name: '🎒 出发前（5.2 前）', color: 'blue' },
    { id: 'g_53',  name: '🏔️ 5.3 连云港',      color: 'green' },
    { id: 'g_54',  name: '🥟 5.4 淮安',          color: 'orange' },
    { id: 'g_after', name: '🏠 回程后',          color: 'purple' }
  ],
  items: [
    // 出发前
    { id:'p1', groupId:'g_pre', text:'12306 锁 5.3 晚跨城高铁票（20:00–21:30 黄金车次）', link:'https://www.12306.cn/' },
    { id:'p2', groupId:'g_pre', text:'公众号「花果山景区」预约 5.3 门票（提前 3 天）' },
    { id:'p3', groupId:'g_pre', text:'公众号「龙宫大白鲸」预约 5.4 门票（提前 2 天）' },
    { id:'p4', groupId:'g_pre', text:'公众号「白马湖旅游度假区」预约三岛奇遇记' },
    { id:'p5', groupId:'g_pre', text:'查 5.3–5.4 天气，准备折叠伞', link:'https://www.weather.com.cn/weather/101191101.shtml' },
    { id:'p6', groupId:'g_pre', text:'防晒霜（SPF30+）、遮阳帽、墨镜' },
    { id:'p7', groupId:'g_pre', text:'薄外套 + 舒服的运动鞋' },
    { id:'p8', groupId:'g_pre', text:'充电宝、数据线、防水手机壳' },
    { id:'p9', groupId:'g_pre', text:'备好现金零钱（景区小摊偶尔不收线上）' },
    // 5.3 连云港
    { id:'t1', groupId:'g_53', text:'🏔️ 花果山水帘洞从里面钻一下' },
    { id:'t2', groupId:'g_53', text:'🐒 玉女峰"海天一色"石刻合影' },
    { id:'t3', groupId:'g_53', text:'🌊 连岛苏马湾看日落' },
    { id:'t4', groupId:'g_53', text:'🦀 渔村第一鲜吃皮皮虾 + 梭子蟹' },
    { id:'t5', groupId:'g_53', text:'🐟 点一碗沙光鱼汤（连云港特产）' },
    { id:'t6', groupId:'g_53', text:'🎫 收好花果山 + 连岛门票凭证' },
    // 5.4 淮安
    { id:'t7', groupId:'g_54', text:'🏮 河下古镇石板街夜景照' },
    { id:'t8', groupId:'g_54', text:'🥟 文楼吃一笼刚出锅的汤包' },
    { id:'t9', groupId:'g_54', text:'🐍 尝一次软兜长鱼' },
    { id:'t10', groupId:'g_54', text:'🐱 肥猫岛绿巨猫脚下仰拍' },
    { id:'t11', groupId:'g_54', text:'😺 撸一只肥猫岛的治愈系猫咪' },
    { id:'t12', groupId:'g_54', text:'🐳 龙宫海底隧道拍鲨鱼游过（如选 B 方案）' },
    { id:'t13', groupId:'g_54', text:'🍵 喝一次淮安早茶（文楼 8:00）' },
    // 回程后
    { id:'a1', groupId:'g_after', text:'整理两天照片，挑 20 张发朋友圈' },
    { id:'a2', groupId:'g_after', text:'把高铁票 / 门票存档报销' }
  ]
};

/* 地点按出行日分组（以方案 A 为基础），支持自定义分组 */
const DEFAULT_PLACES = {
  groups: [
    { id: 'day_0', name: '🏨 住宿 & 车站', color: '#EF4444' },
    { id: 'day_53', name: '🏔️ 5.3 连云港', color: '#16A34A' },
    { id: 'day_54', name: '🥟 5.4 淮安', color: '#EA580C' },
    { id: 'day_food', name: '🍽️ 美食', color: '#9333EA' },
    { id: 'day_alt', name: '🔄 备选景点', color: '#0891B2' }
  ],
  items: [
    { id:'pl1', groupId:'day_0', name:'云隐园居（连云港高铁站）', type:'hotel', city:'连云港', lat:34.749, lng:119.135, desc:'5.2 夜住宿' },
    { id:'pl2', groupId:'day_0', name:'连云港站', type:'station', city:'连云港', lat:34.747, lng:119.134, desc:'高铁站' },
    { id:'pl3', groupId:'day_0', name:'如家排柏·云酒店（河下古镇）', type:'hotel', city:'淮安', lat:33.590, lng:119.108, desc:'5.3 夜住宿' },
    { id:'pl4', groupId:'day_0', name:'淮安东站', type:'station', city:'淮安', lat:33.663, lng:119.196, desc:'5.4 晚离开' },

    { id:'pl5', groupId:'day_53', name:'花果山景区', type:'spot', city:'连云港', lat:34.642, lng:119.241, desc:'西游记原型地，门票 90' },
    { id:'pl6', groupId:'day_53', name:'连岛苏马湾', type:'spot', city:'连云港', lat:34.770, lng:119.471, desc:'江苏最大海滨浴场，门票 50' },
    { id:'pl7', groupId:'day_53', name:'连岛大沙湾', type:'spot', city:'连云港', lat:34.776, lng:119.441, desc:'沙滩 + 海边栈道' },

    { id:'pl8', groupId:'day_54', name:'河下古镇', type:'spot', city:'淮安', lat:33.590, lng:119.104, desc:'淮扬菜发源地' },
    { id:'pl9', groupId:'day_54', name:'吴承恩故居', type:'spot', city:'淮安', lat:33.585, lng:119.101, desc:'河下古镇内' },
    { id:'pl10', groupId:'day_54', name:'白马湖三岛奇遇记', type:'spot', city:'淮安', lat:33.201, lng:119.009, desc:'肥猫岛 + 鸸鹋岛 + 白马岛' },
    { id:'pl11', groupId:'day_54', name:'龙宫大白鲸欢乐世界', type:'spot', city:'淮安', lat:33.558, lng:119.124, desc:'苏北最大海洋乐园' },

    { id:'pl12', groupId:'day_food', name:'渔村第一鲜', type:'food', city:'连云港', lat:34.770, lng:119.478, desc:'本地海鲜排档头牌' },
    { id:'pl13', groupId:'day_food', name:'文楼（河下古镇）', type:'food', city:'淮安', lat:33.591, lng:119.105, desc:'文楼汤包发源地' },
    { id:'pl14', groupId:'day_food', name:'清溪楼', type:'food', city:'淮安', lat:33.590, lng:119.106, desc:'河下古镇淮扬菜' },

    { id:'pl15', groupId:'day_alt', name:'在中路（海滨公路）', type:'spot', city:'连云港', lat:34.787, lng:119.425, desc:'网红海滨公路' },
    { id:'pl16', groupId:'day_alt', name:'连云老街', type:'spot', city:'连云港', lat:34.750, lng:119.411, desc:'民国建筑' },
    { id:'pl17', groupId:'day_alt', name:'周恩来故里景区', type:'spot', city:'淮安', lat:33.543, lng:119.017, desc:'免费' },
    { id:'pl18', groupId:'day_alt', name:'里运河清江大闸', type:'spot', city:'淮安', lat:33.609, lng:119.033, desc:'夜游船发船点' },
    { id:'pl19', groupId:'day_alt', name:'淮安府署', type:'spot', city:'淮安', lat:33.555, lng:119.024, desc:'古代官署' }
  ]
};

/* ---------- 只读辅助数据（不需要编辑） ---------- */
const RESTAURANTS_LYG = [
  { name: '渔村第一鲜（连岛店）', desc: '本地排档头牌，明码标价', avg: '¥150', url: 'https://www.dianping.com/search/keyword/25/0_渔村第一鲜' },
  { name: '老街渔家', desc: '渔家菜，沙光鱼汤绝', avg: '¥130', url: 'https://www.dianping.com/search/keyword/25/0_老街渔家' },
  { name: '连云老街海鲜咖啡馆', desc: '文艺路线拍照好看', avg: '¥180', url: 'https://www.dianping.com/search/keyword/25/0_连云老街海鲜咖啡' }
];
const MUSTEAT_LYG = ['🦐 皮皮虾','🦀 梭子蟹','🐟 沙光鱼','🐙 八爪鱼','🍵 紫菜蛋花汤','🐚 辣螺','🦪 蛏子','🫧 蚬子'];
const RESTAURANTS_HA = [
  { name: '清溪楼·淮扬菜（河下古镇店）', desc: '经典淮扬', avg: '¥79', url: 'https://www.dianping.com/search/keyword/134/0_清溪楼淮扬菜' },
  { name: '文楼（古镇内）', desc: '文楼汤包发源地', avg: '¥60', url: 'https://www.dianping.com/search/keyword/134/0_文楼' },
  { name: '长鱼世家', desc: '软兜长鱼专门店', avg: '¥100', url: 'https://www.dianping.com/search/keyword/134/0_长鱼世家' },
  { name: '乡村风情·龙虾私房菜', desc: '淮安小龙虾扛把子', avg: '¥120', url: 'https://www.dianping.com/search/keyword/134/0_乡村风情龙虾' }
];
const MUSTEAT_HA = ['🐍 软兜长鱼','🌿 蒲菜肉圆','🥟 文楼汤包','🍲 平桥豆腐','🍖 钦工肉圆','🥢 淮安小炒','🫓 茶馓','🥬 开洋蒲菜'];
const QUICK_LINKS = [
  { label: '12306 购票', icon: 'train-front', url: 'https://www.12306.cn/' },
  { label: '高德地图', icon: 'map', url: 'https://www.amap.com/' },
  { label: '携程攻略', icon: 'globe', url: 'https://you.ctrip.com/' },
  { label: '中国天气网', icon: 'cloud', url: 'https://www.weather.com.cn/' },
  { label: '大众点评 · 连云港', icon: 'utensils', url: 'https://www.dianping.com/lianyungang' },
  { label: '大众点评 · 淮安', icon: 'utensils', url: 'https://www.dianping.com/huaian' }
];
