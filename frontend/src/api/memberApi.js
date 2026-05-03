import api from './index';

// 회원 API 서비스
const memberApi ={
    // 회원 조회(ID) ``
    getMember: (id) => {
        return api.get(`/members/${id}`);
    },

    //전체 목록 조회
    getAllMembers: () => {
        return api.get('/members');
    },
    // 회원 정보 수정
    updateMember: (id,userData) => {
        return api.put(`/members/${id}`, userData)
    },
    
    //회원 삭제
    deleteMember: (id) => {
        return api.delete(`/members/${id}`);
    }
}
export default memberApi
