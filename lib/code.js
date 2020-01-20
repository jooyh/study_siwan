var code = {
     SUCC_01 : '정상적으로 조회 되었습니다.'
    ,SUCC_02 : '정상적으로 등록 되었습니다.'
    ,SUCC_03 : '정상적으로 수정 되었습니다.'
    ,SUCC_04 : '정상적으로 삭제 되었습니다.'
    ,ERR_00 : '시스템 오류가 발생했습니다.'
    ,ERR_01 : '조회 중 오류가 발생했습니다.'
    ,ERR_02 : '등록 중 오류가 발생했습니다.'
    ,ERR_03 : '수정 중 오류가 발생했습니다.'
    ,ERR_04 : '삭제 중 오류가 발생했습니다.'
    ,VAL_01 : '사용자가 존재하지 않습니다.'
    ,VAL_02 : '로그인 정보를 확인 해 주세요.'
    ,VAL_03 : '이미 팔로우 한 사용자 입니다.'

    ,resResultObj : function(result_code,data){
        var result = {};
        result.data = data;
        result.msg = this[result_code]
        result.code = result_code;
        return result;
    }
}
module.exports=code;