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
  displayPillDesc,
  displayPillFuncText,
  displayToastText,
  displayBattleAnalysisText,
  displayBuffName,
  displayBuffDesc,
  displayArtifactName,
  displayArtifactDesc,
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
  displayMansionLine,
  displayTitleName,
  displayTitleDesc,
  displayComboArtName,
  displayComboArtDesc,
  displayComboArtCost,
  displayGongfaBranchDesc,
  displayEnemySkillName,
  displayCombatBracket,
  displayBuildSourceName,
  displayFightPreviewSkillLine,
  displayFightPreviewRiskLine,
  displayFightPreviewWinText,
  displayMutatorName,
  displayGongfaFuncText,
  displayModsText,
  displayStatLabel,
  displayStatValue,
  displayEventTitle,
  displayEventText,
  displayEventChoiceLabel,
  displayEventOutcomeText,
  displayChoiceHint,
  displayCaveEventTitle,
  displayCaveEventDesc,
  displayCaveEventOptionLabel,
  displayCaveOptionText,
  displayOfflineAwayLine,
  displayOfflineNote,
  displayGNVi,
  displayHerbGradeShort,
  displayMentorName,
  displayMentorMaster,
  displayMentorTitle,
  displayMentorDesc,
  displayMentorNarrative,
  displayEquipDesc,
  displayAffixName,
  displayAffixRarity,
  displayAffixRoll,
  displayAffixDescParts,
  displayTransferLabel,
  displayTransferBlock,
  displayDaoPathName,
  displayDaoPathSeal,
  displayDaoPathDesc,
  displayDaoPathRule,
  displayDaoPathDeep,
  displayCelestialWorldName,
  displayCelestialWorldSeal,
  displayCelestialWorldDesc,
  displayCelestialWorldRule,
  displayVoidWorldName,
  displayVoidWorldSeal,
  displayVoidWorldDesc,
  displayRouteNodeName,
  displayRouteNodeDesc,
  displayRouteRisk,
  displayTrialName,
  displayTrialSeal,
  displayTrialDesc,
  displayTrialRule,
  displayPactName,
  displayPactSeal,
  displayPactDesc,
  displayPactRule,
  displayFurnaceRateName,
  displayJudgementLine
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
    expect(displayArtifactDesc('内封一点离火之精')).toBe('Bên trong phong ấn một điểm tinh hoa ly hỏa')
    expect(displayArtifactName('离火珠')).toBe('Ly Hỏa Châu')
    expect(displayArtifactName('八卦炉')).toBe('Bát Quái Lô')
    expect(displayArtifactActiveName('琼浆')).toBe('Quỳnh Tương')
    expect(displayArtifactActiveName('焚天')).toBe('Phần Thiên')
    expect(displayArtifactLevelLabel('祭炼 4/9 重')).toBe('Tế luyện 4/9 tầng')
    expect(displayArtifactPassive('攻击 +6.6%')).toBe('Công kích +6.6%')
    expect(displayArtifactPassive('生命上限 +10% (须己身气血未满 30%)')).toContain('Sinh mệnh tối đa')
    expect(displayArtifactActiveDesc('每 3 回合喷吐真火,造成 290.4% 攻击伤害')).toBe('Mỗi 3 hiệp phun ra chân hỏa, tạo thành 290.4% sát thương công kích')
    expect(displayArtifactActiveDesc('每 4 回合束缚敌人,其攻击降低 20%')).toBe('Mỗi 4 hiệp trói buộc kẻ địch, công kích của địch giảm 20%')

    // Buffs & Status
    expect(displayBuffName('聚灵')).toBe('Tụ Linh')
    expect(displayBuffName('重伤')).toBe('Trọng Thương')
    expect(displayBuffDesc('灵气汇聚,修炼速度提升 50%')).toBe('Linh khí hội tụ, tốc độ tu luyện tăng 50%')

    // Pill consumption & functions
    expect(displayPillDesc('最粗浅的灵药,聊胜于无')).toBe('Linh dược thô sơ nhất, có còn hơn không')
    expect(displayPillFuncText('服之化开「聚灵」:修炼速度 +50%(持续 30 分钟)')).toBe('Uống vào giải hóa「Tụ Linh」: Tốc độ tu luyện +50% (Duy trì 30 phút)')
    expect(displayPillFuncText('服之:修为 +折合闭关 一刻(15 分钟)(至多不满一层)')).toContain('Uống vào: Tu vi +tương đương bế quan')
    expect(displayToastText('服下「凝神丹」,药力化开,状态加身')).toBe('Uống vào「Ngưng Thần Đan」, dược lực giải hóa, trạng thái gia thân')
    expect(displayToastText('服下「玄元丹」,修为 +150(约抵闭关 一刻(15 分钟))')).toContain('Uống vào「Huyền Nguyên Đan」')
    expect(displayToastText('连服 5 枚「聚气丹」(仅存 5 枚)')).toBe('Uống liên tiếp 5 viên「Tụ Khí Đan」(chỉ còn 5 viên)')
    expect(displayToastText('炉开丹成,得「护心丹」一枚')).toBe('Lò mở đan thành, nhận được một viên「Hộ Tâm Đan」')
    expect(displayToastText('连炼 3 炉「聚气丹」:成 3 枚')).toBe('Luyện liên tiếp 3 lò「Tụ Khí Đan」: thành 3 viên')
    expect(displayToastText('连炼 3 炉「聚气丹」:成 2 枚,炸 1 炉')).toBe('Luyện liên tiếp 3 lò「Tụ Khí Đan」: thành 2 viên, hỏng 1 lò')
    expect(displayToastText('器灵尘未足')).toBe('Khí Linh Trần không đủ')
    expect(displayToastText('此器已锁,先解锁再凝')).toBe('Vật phẩm này đã khóa, hãy mở khóa trước khi ngưng tụ')

    // Battle Analysis
    expect(displayBattleAnalysisText('此战 5 回合而胜,战后气血 90%')).toBe('Trận này thắng sau 5 hiệp, khí huyết sau trận còn 90%')
    expect(displayBattleAnalysisText('败于第 12 回合')).toBe('Thất bại ở hiệp thứ 12')
    expect(displayBattleAnalysisText('真伤占总承伤 45%,护盾与减伤被绕过')).toBe('Sát thương chuẩn chiếm 45% tổng sát thương gánh chịu, hộ thuẫn cùng giảm thương bị bỏ qua')

    // Combat Log
    expect(displayCombatLog('【赤瞳凶猿】施展一记爪击,却被身形一晃避开。')).toContain('thi triển một đòn trảo kích')
    expect(displayCombatLog('灵光一照,摄魂之力散于无形。')).toBe('linh quang chiếu rọi, lực nhiếp hồn tiêu tán vô hình.')

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

  it('translates title, combo arts, and skill system components', () => {
    // Titles
    expect(displayTitleName('初入仙途')).toBe('Sơ Nhập Tiên Đồ')
    expect(displayTitleName('炼气修士')).toBe('Luyện Khí Tu Sĩ')
    expect(displayTitleName('一剑破万法')).toBe('Nhất Kiếm Phá Vạn Pháp')
    expect(displayTitleName('万道之祖')).toBe('Vạn Đạo Chi Tổ')
    expect(displayTitleDesc('踏出修行第一步')).toBe('Bước chân đầu tiên trên con đường tu hành')
    expect(displayTitleDesc('击败十位区域之主')).toBe('Đánh bại mười vị chúa tể khu vực')

    // Combo arts
    expect(displayComboArtName('玄罡反震')).toBe('Huyền Cương Phản Chấn')
    expect(displayComboArtName('枯泽回春')).toBe('Khô Trạch Hồi Xuân')
    expect(displayComboArtName('锋连诀')).toBe('Phong Liên Quyết')
    expect(displayComboArtDesc('护盾被击破的刹那,碎光化作一次强化反击(每场至多两次)')).toContain('hộ thuẫn bị đánh nát')
    expect(displayComboArtCost('依赖护盾节奏,真伤之敌可绕过罡盾使其无从触发')).toContain('Phụ thuộc vào nhịp độ hộ thuẫn')

    // Gongfa branch desc & func text
    expect(displayGongfaBranchDesc('太玄入杀道,攻伐更烈')).toContain('Thái Huyền nhập sát đạo')
    expect(displayGongfaFuncText('圆满(10 层)可得:攻击 +10\n附带神通「太玄一气」:出手 20% 几率,150% 威力。须设为主修,战斗只出这一式')).toContain('Viên mãn (10 tầng)')
    expect(displayGongfaFuncText('附带神通「太玄一气」:出手 20% 几率,150% 威力。须设为主修,战斗只出这一式')).toContain('Thái Huyền Nhất Khí')

    // Enemy skills & combat bracket
    expect(displayEnemySkillName('裂空爪')).toBe('Liệt Không Trảo')
    expect(displayEnemySkillName('九霄神雷')).toBe('Cửu Tiêu Thần Lôi')
    expect(displayCombatBracket('裂空爪')).toBe('Liệt Không Trảo')
    expect(displayCombatBracket('太玄一气')).toBe('Thái Huyền Nhất Khí')
    expect(displayCombatBracket('一剑破万法')).toBe('Nhất Kiếm Phá Vạn Pháp')
    expect(displayCombatBracket('墨玉葫芦')).toBe('Mặc Ngọc Hồ Lô')
    expect(displayCombatLog('你施展【太玄一气】,击中【独角妖狼】。')).toContain('Thái Huyền Nhất Khí')
    expect(displayCombatLog('【独角妖狼】狂化!')).toContain('Cuồng Hóa!')

    // Build source names
    expect(displayBuildSourceName('称号·一剑破万法')).toBe('Danh hiệu · Nhất Kiếm Phá Vạn Pháp')
    expect(displayBuildSourceName('功法·太玄引气诀')).toBe('Công pháp · Thái Huyền Dẫn Khí Quyết')
    expect(displayBuildSourceName('分支·杀伐')).toBe('Nhánh · Sát Phạt')
    expect(displayBuildSourceName('法宝·墨玉葫芦')).toBe('Pháp bảo · Mặc Ngọc Hồ Lô')

    // Fight preview & Mutators
    expect(displayFightPreviewSkillLine('【裂空爪】重击 · 寻常出手 · 威力 1.8 倍')).toContain('【Liệt Không Trảo】Trọng Kích')
    expect(displayFightPreviewWinText('胜算在握')).toBe('Thắng phần nắm chắc')
    expect(displayFightPreviewRiskLine('天时仅 30 回合,拖延即败')).toBe('Thiên thời chỉ có 30 hiệp, kéo dài liền bại')
    expect(displayMutatorName('生机凋敝')).toBe('Sinh Cơ Điêu Bế')

    // Reward preview with title & pill
    expect(displayRewardPreview('灵石 +100 · 称号「炼气修士」 · 丹药「聚气丹」')).toBe('Linh Thạch +100 · Danh Hiệu「Luyện Khí Tu Sĩ」 · Đan Dược「Tụ Khí Đan」')
  })

  it('translates mod text, stat names and caveats for skills and titles', () => {
    expect(displayStatLabel('修炼速度')).toBe('Tốc Độ Tu Luyện')
    expect(displayStatLabel('先手判定')).toBe('Phán Định Tiên Thủ')
    expect(displayStatLabel('连击')).toBe('Liên Kích')
    expect(displayStatLabel('追击威力')).toBe('Uy Lực Truy Kích')
    expect(displayStatLabel('攻击')).toBe('Tấn Công')

    expect(displayStatValue('+8%(须不弱于对手,方得抢先)')).toBe('+8%(cần không yếu hơn đối thủ mới được đi trước)')
    expect(displayStatValue('+5%(另起一击,非连段暴击)')).toBe('+5%(đánh thêm một đòn, không phải bạo kích nhiều đoạn)')
    expect(displayStatValue('+15%(只增追击,不增本击)')).toBe('+15%(chỉ tăng truy kích, không tăng bản kích)')

    const sampleMods = '修炼速度 +40% · 攻击 +25% · 先手判定 +8%(须不弱于对手,方得抢先) · 连击 +5%(另起一击,非连段暴击) · 追击威力 +15%(只增追击,不增本击)'
    const translated = displayModsText(sampleMods)
    expect(translated).toContain('Tốc Độ Tu Luyện +40%')
    expect(translated).toContain('Tấn Công +25%')
    expect(translated).toContain('Phán Định Tiên Thủ +8%(cần không yếu hơn đối thủ mới được đi trước)')
    expect(translated).toContain('Liên Kích +5%(đánh thêm một đòn, không phải bạo kích nhiều đoạn)')
    expect(translated).toContain('Uy Lực Truy Kích +15%(chỉ tăng truy kích, không tăng bản kích)')
  })

  it('translates events and cave events', () => {
    expect(displayEventTitle('褴褛乞丐')).toBe('Kẻ Ăn Mày Rách Rưới')
    expect(displayEventText('一个乞丐伸手拦你:「小友,赏口饭吃,老朽必有厚报。」')).toBe('Một kẻ ăn mày đưa tay chặn ngươi: "Tiểu hữu, bố thí miếng ăn, lão hủ ắt có hậu tạ."')
    expect(displayEventChoiceLabel('赠他灵石')).toBe('Tặng ông ta linh thạch')
    expect(displayEventChoiceLabel('置之不理')).toBe('Không thèm đếm xỉa')
    expect(displayChoiceHint('花费灵石 34.2')).toBe('Chi trả Linh Thạch 34.2')
    expect(displayChoiceHint('可能花费灵石 100–200')).toBe('Có thể chi trả Linh Thạch 100–200')
    expect(displayEventOutcomeText('乞丐眨眼消失,你手中多了一颗温热的丹药。')).toBe('Kẻ ăn mày chớp mắt biến mất, trong tay ngươi có thêm một viên đan dược ấm nóng.')

    expect(displayCaveEventTitle('灵田异象')).toBe('Linh Điền Dị Tượng')
    expect(displayCaveEventDesc('灵田中灵气波动异常')).toBe('Linh khí trong linh điền dao động bất thường')
    expect(displayCaveEventOptionLabel('疏导灵气')).toBe('Sơ đạo linh khí')
    expect(displayCaveOptionText('修炼速度 +10%, duy trì 60 giây')).toContain('Tốc Độ Tu Luyện +10%')
  })

  it('translates offline reward dialog components (awayLine, notes, numbers, herbs)', () => {
    // 1. awayLine
    expect(displayOfflineAwayLine('此去 2小时1分 · 离线按 90% 收益计')).toBe('Đã rời đi 2 giờ 1 phút · Ngoại tuyến tính 90% thu ích')
    expect(displayOfflineAwayLine('此去 60小时(收益按 8小时 结算 · 离线按 90% 收益计)')).toBe('Đã rời đi 60 giờ (Thu ích tính theo 8 giờ kết toán · Ngoại tuyến tính 90% thu ích)')

    // 2. Big number magnitude units
    expect(displayGNVi('+47.92亿')).toBe('+47.92 Ức')
    expect(displayGNVi('+2.367亿')).toBe('+2.367 Ức')
    expect(displayGNVi('176.1万')).toBe('176.1 Vạn')

    // 3. Herb grades
    expect(displayHerbGradeShort(1)).toBe('Phàm Phẩm')
    expect(displayHerbGradeShort(3)).toBe('Tiên Phẩm')

    // 4. Notes
    expect(
      displayOfflineNote('「气运加身、混天一气、道胎不灭、清风拂面」已到期')
    ).toBe('「Khí Vận Gia Thân, Hỗn Thiên Nhất Khí, Đạo Thai Bất Diệt, Thanh Phong Phất Diện」đã hết hạn')

    expect(
      displayOfflineNote('镇压诸域仍有余韵:灵石 +176.1万 · 玄铁 +46 · 凡品灵草 +132 · 功法残页 +30')
    ).toBe('Trấn áp các vực vẫn còn dư vận: Linh Thạch +176.1 Vạn · Huyền Thiết +46 · Phàm Phẩm Linh Thảo +132 · Công Pháp Tàn Trang +30')

    expect(
      displayOfflineNote('沉沙古城之行圆满结束')
    ).toBe('Hành trình Trầm Sa Cổ Thành viên mãn kết thúc')

    expect(
      displayOfflineNote('此去寿元流逝 2 载')
    ).toBe('Chuyến đi này thọ nguyên trôi qua 2 năm')

    expect(
      displayOfflineNote('另有 5 件寻常之物,已折作器灵尘')
    ).toBe('Ngoài ra có 5 vật phẩm tầm thường, đã quy đổi thành Khí Linh Trần')

    expect(
      displayOfflineNote('有 2 战失利,幸而全身而退')
    ).toBe('Có 2 trận thất lợi, may mắn toàn thân trở lui')

    expect(
      displayOfflineNote('挂单之间,你已将【黑风狼】斩于剑下(离线战果,收益折损)')
    ).toBe('Trong lúc bận rộn, ngươi đã chém 【Hắc Phong Lang】 dưới mũi kiếm (chiến quả ngoại tuyến, thu ích chiết giảm)')

    expect(
      displayOfflineNote('曾遭遇区域之主【黑风狼】,惜败而退,需再蓄力')
    ).toBe('Từng tao ngộ chúa tể khu vực 【Hắc Phong Lang】, tiếc nuối bại lui, cần tích lũy thêm sức lực')
  })

  it('translates mentor info and narratives correctly', () => {
    expect(displayMentorName('剑修')).toBe('Kiếm Tu')
    expect(displayMentorMaster('青松剑叟')).toBe('Thanh Tùng Kiếm Tẩu')
    expect(displayMentorTitle('一剑破万法')).toBe('Nhất Kiếm Phá Vạn Pháp')
    expect(displayMentorDesc('锋芒更利,暴击更易')).toBe('Phong mang càng bén, bạo kích càng dễ')
    expect(displayMentorNarrative('师尊抚剑而笑:「剑心渐明,锋芒初露。」')).toBe('Sư tôn vuốt kiếm mỉm cười: "Kiếm tâm dần sáng, phong mang sơ lộ."')
  })

  it('translates equipment flavor descriptions', () => {
    expect(displayEquipDesc('魔渊里浸过的刀,刀身不反光')).toBe('Thanh đao từng ngâm trong Ma Uyên, thân đao không phản quang')
    expect(displayEquipDesc('山后砍来的竹子削成,胜在趁手')).toBe('Gọt từ cây trúc chặt sau núi, được cái vừa tay')
  })

  it('translates affixes, rarities, rolls and desc parts', () => {
    expect(displayAffixName('斩灭')).toBe('Trảm Diệt')
    expect(displayAffixName('破军')).toBe('Phá Quân')
    expect(displayAffixRarity('稀有')).toBe('Hiếm')
    expect(displayAffixRarity('传世')).toBe('Truyền thế')
    expect(displayAffixRoll('浮 69%')).toBe('~69%')

    const parts = displayAffixDescParts({ id: 'exe1', before: '对生命低于三成之敌伤害提升 ', after: '%' })
    expect(parts.before).toBe('Sát thương lên kẻ địch dưới 30% khí huyết tăng ')
    expect(parts.after).toBe('%')
  })

  it('translates stat labels and caveats', () => {
    expect(displayStatLabel('处决伤害')).toBe('Sát Thương Hành Quyết')
    expect(displayStatValue('+10%(只伤气血未满 30% 之敌)')).toBe('+10%(chỉ gây thêm thương tổn cho địch có khí huyết dưới 30%)')
  })

  it('translates transfer labels and blocks', () => {
    expect(displayTransferLabel('转移词条')).toBe('Chuyển Từ Điều')
    expect(displayTransferBlock('同一件')).toBe('Cùng một món')
    expect(displayTransferBlock('需神品')).toBe('Cần Thần phẩm')
  })

  it('translates adventure event outcomes including firebird', () => {
    expect(displayEventOutcomeText('羽毛落地化作一枚赤红丹丸。')).toBe('Lông vũ rơi xuống đất hóa thành một viên đan hoàn đỏ rực.')
  })

  it('translates celestial, god, void, and chaos entities correctly', () => {
    // Dao Paths
    expect(displayDaoPathName('剑道')).toBe('Kiếm Đạo')
    expect(displayDaoPathSeal('剑')).toBe('Kiếm')
    expect(displayDaoPathDesc('一剑破万法。极致的锋锐,换走厚重的余地')).toBe(
      'Nhất kiếm phá vạn pháp. Sự sắc bén tột cùng đánh đổi lấy sự vững chãi'
    )
    expect(displayDaoPathRule('暴击率 +10%,暴击伤害 +30%')).toBe('Tỉ lệ bạo kích +10%, sát thương bạo kích +30%')
    expect(displayDaoPathDeep('远征蓄势:每胜一场,剑意再添一层')).toBe('Viễn chinh súc thế: Mỗi khi thắng một trận, kiếm ý tăng thêm một tầng')

    // Celestial and Void Worlds
    expect(displayCelestialWorldName('赤炎天')).toBe('Xích Viêm Thiên')
    expect(displayCelestialWorldSeal('炎')).toBe('Viêm')
    expect(displayCelestialWorldDesc('天穹燃烧,雷火贯体。此界只问一件事:你扛得住几击?')).toBe(
      'Thiên khung rực cháy, lôi hỏa xuyên thân. Giới này chỉ hỏi một câu: Ngươi chịu nổi mấy đòn?'
    )
    expect(displayCelestialWorldRule('敌人攻击 +40%')).toBe('Địch nhân tấn công +40%')

    // Procedural Void Worlds and World Bosses
    expect(displayVoidWorldName('玄冥渊')).toBe('Huyền Minh Uyên')
    expect(displayVoidWorldName('玄冥渊之主')).toBe('Huyền Minh Uyên Chi Chủ')
    expect(displayEnemyName('赤炎天之主')).toBe('Xích Viêm Thiên Chi Chủ')
    expect(displayVoidWorldSeal('虚')).toBe('Hư')
    expect(displayVoidWorldDesc('此乃「幽冷孤寂」之界,天道以变数织成。与诸天相似不足3成,规则无常,过审方存。')).toBe(
      'Đây là thế giới 「幽冷孤寂」, Thiên Đạo lấy biến số dệt thành. Tương tự chư thiên không đến 3 phần, quy tắc vô thường, qua thẩm định mới tồn tại.'
    )

    // Route Nodes & Risks
    expect(displayRouteNodeName('断径')).toBe('Đoạn Kính')
    expect(displayRouteNodeName('幽崖')).toBe('U Nhai')
    expect(displayRouteNodeName('火海')).toBe('Hỏa Hải')
    expect(displayRouteNodeDesc('赤炎狱卒盘踞于此')).toBe('Xích Viêm Ngục Tốt chiếm giữ nơi này')
    expect(displayRouteNodeDesc('【赤炎狱卒】盘踞于此')).toBe('【Xích Viêm Ngục Tốt】 chiếm giữ nơi này')
    expect(displayRouteRisk('高爆发')).toBe('Bộc phát cao')
    expect(displayRouteRisk('强敌当关')).toBe('Cường địch chắn cửa')

    // Trials & Pacts
    expect(displayTrialName('七杀试炼')).toBe('Thất Sát Thử Thách')
    expect(displayTrialSeal('七')).toBe('Thất')
    expect(displayTrialDesc('七场连战,不得换装,场场增强。记录你最快的杀伐')).toBe(
      'Bảy trận liên chiến, không được đổi trang bị, mỗi trận mạnh thêm một bậc. Ghi lại tốc độ sát phạt nhanh nhất của ngươi'
    )
    expect(displayTrialRule('连战 7 场,敌人逐场增强')).toBe('Liên chiến 7 trận, kẻ địch mạnh dần qua từng trận')
    expect(displayPactName('血契')).toBe('Huyết Khế')
    expect(displayPactSeal('血')).toBe('Huyết')
    expect(displayPactDesc('此行不得回血,伤势只进不出')).toBe('Chuyến đi này không được hồi máu, vết thương chỉ thêm chứ không bớt')
    expect(displayPactRule('一切治疗无效 · 道源 ×2.2')).toBe('Mọi trị liệu vô hiệu · Đạo Nguyên ×2.2')

    // Furnace & Judgement
    expect(displayFurnaceRateName('玄铁')).toBe('Huyền Thiết')
    expect(displayFurnaceRateName('器灵尘')).toBe('Khí Linh Trần')
    expect(displayJudgementLine('道之理解:你的构筑厚度 10(基准 8)—— 守关者三维 ×1.2')).toBe(
      'Đạo chi lý giải: Độ dày cấu hình của ngươi 10 (cơ chuẩn 8) —— Tam vi thủ quan giả ×1.2'
    )
    expect(displayJudgementLine('境界压制:未及此界该有的境界 —— 守关者额外增伤 +30%')).toBe(
      'Cảnh giới áp chế: Chưa đạt đến cảnh giới giới này yêu cầu —— Thủ quan giả tăng thêm sát thương +30%'
    )

    // Enemies of God, Chaos, and Celestial
    expect(displayEnemyName('赤炎狱卒')).toBe('Xích Viêm Ngục Tốt')
    expect(displayEnemyName('赤炎天主')).toBe('Xích Viêm Thiên Chủ')
    expect(displayEnemyName('神兵卫')).toBe('Thần Binh Vệ')
    expect(displayEnemyName('神王')).toBe('Thần Vương')
    expect(displayEnemyName('神帝')).toBe('Thần Đế')
    expect(displayEnemyName('混沌神魔')).toBe('Hỗn Độn Thần Ma')
    expect(displayEnemyName('混沌道祖')).toBe('Hỗn Độn Đạo Tổ')

    // Skills
    expect(displayEnemySkillName('狱火贯心')).toBe('Ngục Hỏa Quán Tâm')
    expect(displayEnemySkillName('神帝一念')).toBe('Thần Đế Nhất Niệm')
    expect(displayEnemySkillName('道祖一斩')).toBe('Đạo Tổ Nhất Trảm')
  })
})

