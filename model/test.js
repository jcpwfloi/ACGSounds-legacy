var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/acgs_sheet');

var Sheet = require('./sheet');


var data = [
    {
        approved: 3,
        sheetName: '肖邦练习曲 Op.25 Nr.11 冬风练习曲',
        sheetIntro: '冬风练习曲，作品25-11（op25nr11）是肖邦练习曲中是技巧最艰深篇幅最大的音乐会练习曲之一。它的训练课题是手指触键的灵敏，快速和准确，与此同时，由于篇幅大，因此对手指快速跑动中的耐力也是一大考验。 这首练习曲的演奏版本很多，比较出色的包括意大利钢琴家波里尼（M.Pollini），法国钢琴家弗朗索瓦（S.Francois），智利钢琴家阿劳（C.Arrou），美国钢琴家布宁（J.Browning）等。',
        sheetTag: ['Chopin Etude','肖邦练习曲','冬风','冬风练习曲','高难度练习曲']
    },
    {
        approved: 3,
        sheetName: '肖邦练习曲 Op.10 Nr.12 革命练习曲',
        sheetIntro: '肖邦的这首练习曲，表现了肖邦在华沙革命失败后内心感受。因此，被后人命名为“革命”练习曲。全曲激昂悲愤，深刻地反映了肖邦在华沙陷落、起义失败后的心情，那催人奋起的旋律，表现了波兰人民的呐喊与抗争。',
        sheetTag: ['Chopin Etude','肖邦练习曲','革命','革命练习曲','高难度练习曲']
    },
    {
        approved: 3,
        sheetName: '肖邦练习曲 Op.10 Nr.5 黑键练习曲',
        sheetIntro: '肖邦练习曲OP10，NO5 ，俗称黑键练习曲。由于绝大多数的音都出现在黑键上，故习惯称之为黑键练习曲。<br>在这支曲子里，肖邦是第一次尝试性的、用有明确练习目的的手法，把旋律和主题交给左手，而让右手持续地弹奏特定的练习音型(Etude-figure)好像是对主题进行注解。它给以后一些练习曲的发展作了有益的探索。',
        sheetTag: ['Chopin Etude','肖邦练习曲','黑键','黑键练习曲','高难度练习曲']
    }];

for (i in data) {
    var sheet = new Sheet(data[i]);
    sheet.save();
}

