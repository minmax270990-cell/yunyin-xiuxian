import { describe, expect, it } from 'vitest'
import {
  displayRealmName,
  displayYears,
  displayEnlightenmentLabel,
  displayEnlightenmentDesc,
  displayWeatherName,
  displayWeatherDesc,
  displayWeatherLine,
  displayGoalText,
  displayGoalHint,
  displayCountdownVi,
  displayRewardPreview,
  displayWorldBrief,
  displayWorldName,
  displayPrepLabel,
  displayRealmDesc,
  displayRealmBasis,
  displayRealmLore,
  displayCnNum,
  displayTerrain,
  displayWorldSummary,
  displayMutatorText,
  displayLoreStageName,
  displayLoreElement,
  displayLoreFrame,
  displayLoreSkillNote,
  displayLorePhaseAt,
  displayLorePhaseLabel,
  displayLoreArchetype,
  displayLoreArchetypeLabel,
  displayDirection,
  displayImageName,
  displayRegionName,
  displayExploreMode,
  displayEnemyName,
  displayEquipName,
  displayEquipSlot,
  displayEquipSetName,
  displayEquipSetDesc,
  displayCombatLog,
  displayPillName,
  displayArtifactName,
  displayArtifactActiveName,
  displayQualityName,
  displayTribulationTitle,
  displayTribulationVerdict,
  displayTribulationRisk,
  displayTribulationAdvice,
  displayArtifactLevelLabel,
  displayArtifactPassive,
  displayArtifactActiveDesc,
  displayGongfaName,
  displayGongfaSkillName,
  displayGongfaBranchName,
  displayGongfaDesc,
  displayGongfaSkillLine,
  displayRegionDesc,
  displayEventTierName,
  displayDangerName,
  displayProsperityName,
  displayProduceTierText,
  displaySuppressResourceName,
  displayRetreatGainText,
  displayTierOddsText,
  displayFoeOriginPartsText,
  displayMansionLine
} from './displayZhVi'

describe('displayZhVi localization helpers', () => {
  it('translates realm names and labels', () => {
    expect(displayRealmName('炼气')).toBe('Luyện Khí')
    expect(displayRealmName('炼气·Tầng 3')).toBe('Luyện Khí · Tầng 3')
    expect(displayRealmName('筑基·Viên Mãn')).toBe('Trúc Cơ · Viên Mãn')
    expect(displayRealmName('Thử đột phá 「炼气·Tầng 4」')).toBe('Thử đột phá 「Luyện Khí · Tầng 4」')
  })

  it('translates years suffix', () => {
    expect(displayYears(150)).toBe('150 năm')
    expect(displayYears('150载')).toBe('150 năm')
    expect(displayYears('1.2 亿载')).toBe('1.2 亿 năm')
  })

  it('translates enlightenment options', () => {
    expect(displayEnlightenmentLabel('悟透瓶颈')).toBe('Ngộ Thấu Bình Cảnh')
    expect(displayEnlightenmentLabel('道心通明')).toBe('Đạo Tâm Thông Minh')
    expect(displayEnlightenmentLabel('锤炼筋骨')).toBe('Chùy Luyện Cân Cốt')

    expect(
      displayEnlightenmentDesc('进阶成功率 +8%(只入小进阶;大关天劫不与),持续 30分钟')
    ).toBe('Tỉ lệ tiến giai thành công +8% (chỉ áp dụng tiểu tiến giai; đại quan thiên kiếp không tính), duy trì 30 phút')

    expect(displayEnlightenmentDesc('修炼速度 +35%,持续 5分钟')).toBe(
      'Tốc độ tu luyện +35%, duy trì 5 phút'
    )
    expect(displayEnlightenmentDesc('立即获得 5 悟道点')).toBe('Lập tức nhận được 5 điểm ngộ đạo')
  })

  it('translates weather info', () => {
    expect(displayWeatherName({ id: 'lingyu', name: '灵雨' })).toBe('Linh Vũ')
    expect(
      displayWeatherDesc({ id: 'lingyu', desc: '灵雨润泽,灵气恢复与修炼皆有裨益。' })
    ).toBe('Mưa linh nhuần thấm, hồi phục linh khí cùng tu luyện đều có lợi.')
    expect(displayWeatherLine('今日:灵气恢复 +20% · 修炼速度 +10%')).toBe(
      'Hôm nay: Hồi phục linh khí +20% · Tốc độ tu luyện +10%'
    )
  })

  it('translates goal hint and countdown', () => {
    expect(displayGoalText('深入「百草山」')).toBe('Tiến sâu vào 「百草山」')
    expect(
      displayGoalHint(
        '这一步是小进阶,静坐调息、服用聚气丹或凝神丹可提升进阶成功率;灵气还差 0.052 才够破境'
      )
    ).toContain('Bước này là tiểu tiến giai')
    expect(displayCountdownVi('15时20分')).toBe('15 giờ 20 phút')
    expect(displayCountdownVi('00分07秒')).toBe('00 phút 07 giây')
  })

  it('translates rewards preview', () => {
    expect(displayRewardPreview('灵石 +45.6 · 残页 +6')).toBe('Linh Thạch +45.6 · Tàn Diệp +6')
    expect(displayRewardPreview('凡品灵草 +8')).toBe('Phàm Phẩm Linh Thảo +8')
    expect(displayRewardPreview('悟道点 +4')).toBe('Điểm Ngộ Đạo +4')
  })

  it('translates world brief and names', () => {
    expect(displayWorldBrief('废墟与山岳交错之世')).toBe('Thế giới Phế Tích cùng Sơn Nhạc đan xen')
    expect(displayWorldName('人间界')).toBe('Nhân Gian Giới')
    expect(displayPrepLabel('静坐调息')).toBe('Tĩnh Tọa Điều Tức')
    expect(displayRealmBasis('内丹')).toBe('Nội Đan')
    expect(displayRealmDesc('凝气成丹，九转功成，神识初生')).toBe('Ngưng khí thành đan, cửu chuyển công thành, thần thức sơ sinh')
    expect(displayRealmLore('突破至炼气')).toContain('Luyện Khí')
    expect(displayTerrain('山岳')).toBe('Sơn Nhạc')
    expect(displayWorldSummary('草木丰饶之地,废墟与山岳相间,为生机断绝所笼罩')).toContain('Phế Tích cùng Sơn Nhạc')
    expect(displayMutatorText('治疗效率 -75%')).toBe('Hiệu suất trị liệu -75%')
    expect(displayCnNum('四')).toBe('4')
  })

  it('translates combat enemy lore details', () => {
    expect(displayLoreStageName('洞悉')).toBe('Thấu triệt')
    expect(displayLoreElement('金')).toBe('Kim')
    expect(displayLoreFrame('气血绵长')).toBe('Khí huyết miên trường')
    expect(displayLoreSkillNote('寻常一击')).toBe('Đòn đánh thông thường')
    expect(displayLorePhaseAt('血余 50%')).toBe('Máu còn lại 50%')
    expect(displayLorePhaseLabel('狂化')).toBe('Cuồng Hóa')
    expect(displayLoreArchetype('越战越狂——拖得越久它越凶')).toContain('Càng đánh càng cuồng')
    expect(displayLoreArchetypeLabel('狂暴')).toBe('Cuồng Bạo')
    expect(displayDirection('东')).toBe('Đông')
    expect(displayImageName('青龙')).toBe('Thanh Long')
  })

  it('translates region, enemy, equip, slot, set and combat log strings', () => {
    // Regions
    expect(displayRegionName('青云山麓')).toBe('Thanh Vân Sơn Lộc')
    expect(displayRegionName('寒潭幽窟')).toBe('Hàn Đàm U Quật')
    expect(displayExploreMode('深入探寻')).toBe('Thâm Nhập Thám Tầm')
    expect(displayExploreMode('寻常游历')).toBe('Du Ngoạn Bình Thường')

    // Enemies
    expect(displayEnemyName('寒潭水蛇')).toBe('Hàn Đàm Thủy Xà')
    expect(displayEnemyName('独角妖狼')).toBe('Độc Giác Yêu Lang')

    // Equips & slots
    expect(displayEquipName('黑风剑')).toBe('Hắc Phong Kiếm')
    expect(displayEquipName('玄铁冠')).toBe('Huyền Thiết Quán')
    expect(displayEquipSlot('weapon')).toBe('Vũ Khí')
    expect(displayEquipSlot('武器')).toBe('Vũ Khí')
    expect(displayEquipSlot('头冠')).toBe('Đầu Quán')

    // Equip set & effects
    expect(displayEquipSetName('铁壁共鸣')).toBe('Thiết Bích Cộng Hưởng')
    expect(displayEquipSetDesc('受到致命伤害时,首次保留 1 点气血')).toBe('Khi chịu sát thương chí mạng, lần đầu giữ lại 1 điểm khí huyết')

    // Combat logs
    expect(displayCombatLog('你与【寒潭水蛇】狭路相逢!')).toBe('Ngươi và 【Hàn Đàm Thủy Xà】 ngõ hẹp tương phùng!')
    expect(displayCombatLog('你祭出一记攻势,击中【寒潭水蛇】。')).toBe('Ngươi xuất chiêu một đòn công kích, đánh trúng 【Hàn Đàm Thủy Xà】.')
    expect(displayCombatLog('【寒潭水蛇】祭出一记爪击,击中你。')).toBe('【Hàn Đàm Thủy Xà】 xuất chiêu một đòn trảo kích, đánh trúng ngươi.')
    expect(displayCombatLog('你气息平复,伤势缓缓愈合。')).toBe('Ngươi khí tức bình phục, thương thế dần dần hồi phục.')
    expect(displayCombatLog('【寒潭水蛇】轰然倒地,魂飞魄散。此战,你胜了。')).toBe('【Hàn Đàm Thủy Xà】 ầm ầm ngã xuống, hồn phi phách tán. Trận này, ngươi thắng rồi.')
  })

  it('translates pills, artifacts, quality and tribulation terms', () => {
    // Pills
    expect(displayPillName('玄元丹')).toBe('Huyền Nguyên Đan')
    expect(displayPillName('雷灵丹')).toBe('Lôi Linh Đan')
    expect(displayPillName('聚灵丹')).toBe('Tụ Linh Đan')
    expect(displayPillName('战灵丹')).toBe('Chiến Linh Đan')
    expect(displayPillName('妖血丹')).toBe('Yêu Huyết Đan')
    expect(displayPillName('聚气散')).toBe('Tụ Khí Tán')

    // Quality
    expect(displayQualityName('凡品')).toBe('Phàm phẩm')
    expect(displayQualityName('仙品')).toBe('Tiên phẩm')
    expect(displayQualityName('神品')).toBe('Thần phẩm')

    // Artifacts
    expect(displayArtifactName('墨玉葫芦')).toBe('Mặc Ngọc Hồ Lô')
    expect(displayArtifactName('离火珠')).toBe('Ly Hỏa Châu')
    expect(displayArtifactName('八卦炉')).toBe('Bát Quái Lô')
    expect(displayArtifactActiveName('琼浆')).toBe('Quỳnh Tương')
    expect(displayArtifactActiveName('焚天')).toBe('Phần Thiên')
    expect(displayArtifactLevelLabel('祭炼 4/9 重')).toBe('Tế luyện 4/9 tầng')
    expect(displayArtifactPassive('攻击 +6.6%')).toBe('Công kích +6.6%')
    expect(displayArtifactActiveDesc('每 3 回合喷吐真火,造成 290.4% 攻击伤害')).toBe('Mỗi 3 hiệp phun ra chân hỏa, tạo thành 290.4% sát thương công kích')

    // Tribulations
    expect(displayTribulationTitle('逆流之劫')).toBe('Nghịch Lưu Chi Kiếp')
    expect(displayTribulationVerdict('高风险')).toBe('Rủi ro cao')
    expect(displayTribulationRisk('首轮承伤压力较大(护持不足)')).toBe('Áp lực chịu đòn hiệp đầu lớn (Hộ trì không đủ)')
    expect(displayTribulationRisk('推演于第 6 道天雷不支')).toBe('Suy tính gục ngã ở đạo thiên lôi thứ 6')
    expect(displayTribulationAdvice('凶多吉少。可先练恢复/护持,或等待更顺的天时;若决意一试,备好丹药。')).toContain('Lành ít dữ nhiều')

    // Realm lore & desc
    expect(displayRealmDesc('婴现顶门,神游太虚')).toBe('Anh hiện đỉnh đầu, thần du thái hư')
    expect(displayRealmLore('承金丹。《性命圭旨》述「婴儿现形」,金丹化婴、顶门出窍,是为元婴。')).toContain('Tiếp nối Kim Đan')
  })

  it('translates gongfa, exploration, mansion, and region lore', () => {
    // Gongfa
    expect(displayGongfaName('太玄引气诀')).toBe('Thái Huyền Dẫn Khí Quyết')
    expect(displayGongfaName('铁骨铮铮功')).toBe('Thiết Cốt Tranh Tranh Công')
    expect(displayGongfaName('百炼锻体术')).toBe('Bách Luyện Đoán Thể Thuật')
    expect(displayGongfaSkillName('太玄一气')).toBe('Thái Huyền Nhất Khí')
    expect(displayGongfaBranchName('杀伐')).toBe('Sát Phạt')
    expect(displayGongfaDesc('大道至简的入门功法,胜在中正平和')).toBe('Công pháp nhập môn đại đạo chí giản, hơn ở chỗ trung chính bình hòa')
    expect(displayGongfaSkillLine({ name: '太玄一气', mult: 1.5, rate: 0.2 })).toContain('Thái Huyền Nhất Khí')

    // Region & exploration
    expect(displayRegionDesc('海面漆黑如墨,不见天日')).toBe('Mặt biển tối đen như mực, chẳng thấy ánh mặt trời')
    expect(displayRegionDesc('地火奔涌,寸草不生')).toBe('Địa hỏa cuộn trào, cỏ cây chẳng mọc')
    expect(displayEventTierName('际遇')).toBe('Tế Ngộ')
    expect(displayEventTierName('奇缘')).toBe('Kỳ Duyên')
    expect(displayEventTierName('机缘')).toBe('Cơ Duyên')
    expect(displayDangerName('凶险')).toBe('Hung hiểm')
    expect(displayProsperityName('稳定')).toBe('Ổn Định')
    expect(displayProduceTierText(9)).toBe('Rơi vật phẩm bậc 9')
    expect(displaySuppressResourceName('玄铁 8/giờ')).toBe('Huyền Thiết 8/giờ')
    expect(displayRetreatGainText('此行约多得修为 47.24万')).toBe('Chuyến này ước tính nhận thêm tu vi 47.24万')
    expect(displayTierOddsText('约每 6 程一次')).toBe('Khoảng mỗi 6 dặm một lần')
    expect(displayTierOddsText('缘起之后才来')).toBe('Duyên khởi mới đến')
    expect(displayFoeOriginPartsText('层级补偿 ×3.38 · 地界凶险 ×1.10')).toBe('Bù trừ cấp bậc ×3.38 · Địa giới hung hiểm ×1.10')

    // Mansion line
    expect(
      displayMansionLine('角木蛟直日 · 青龙东方 · 分野兖州 —— 宜修造与开市,宜起手')
    ).toBe('Giác Mộc Giao trực nhật · Thanh Long phương Đông · Phân dã Diễn Châu —— Tu tạo cùng khai thị, thích hợp xuất thủ')
  })
})

