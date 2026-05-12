import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'            // 페이지 이동
import toast from 'react-hot-toast'
import authApi from '../api/authApi'
import Input from '../components/Input'
import Button from '../components/Button'

export default function SignUpPage() {
    // ======================================================
    // 필드 및 상태 정의
    // ======================================================
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        userId: '',
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        phone: '',
        emailAgreed: false,
    })
    const [errors, setErrors] = useState({})            // 각 필드별 에러 메시지 객체 (예: { username: '사용자명을 입력해주세요.' })

    // ======================================================
    // 유효성 검사
    // ======================================================
    const validate = () => {
        const newErrors = {}

        if (!formData.userId) {
            newErrors.userId = '아이디를 입력해주세요.'
        } else if (formData.userId.length < 4) {
            newErrors.userId = '아이디는 4자 이상이어야 합니다.'
        }

        if (!formData.username) {
            newErrors.username = '사용자명을 입력해주세요.'
        } else if (formData.username.length < 2) {
            newErrors.username = '사용자명은 2자 이상이어야 합니다.'
        }

        if (!formData.email) {
            newErrors.email = '이메일을 입력해주세요.'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식이 아닙니다.'
        }

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요.'
        } else if (formData.password.length < 6) {
            newErrors.password = '비밀번호는 6자 이상이어야 합니다.'
        }

        if (!formData.passwordConfirm) {
            newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.'
        } else if (formData.password !== formData.passwordConfirm) {
            newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
        }

        if (!formData.phone) {
            newErrors.phone = '전화번호를 입력해주세요.'
        } else if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(formData.phone.replace(/-/g, ''))) {
            newErrors.phone = '올바른 전화번호 형식이 아닙니다. (010-1234-5678)'
        }

        setErrors(newErrors)                                // 유효성 검사 후 에러 상태 업데이트
        return Object.keys(newErrors).length === 0          // 에러가 없으면 true 반환, 있으면 false 반환
    }

    // ======================================================
    // 핸들러
    // ======================================================
    const handleChange = (e) => {
        // username, soldesk
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,            // 기본값 유지
            [name]: value       // 해당 필드만 업데이트
        }))

        // 입력 시 해당 필드 에러 제거
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''      // 해당 에러만 지움
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()                          // 폼 제출 시 페이지 새로고침 방지
        
        if (!validate()) return                     // 유효성 검사 실패 시 함수 종료 (회원가입 API 호출 안 함)

        try {
            setLoading(true)
            await authApi.guardianSignUp({
                loginId: formData.userId,
                name: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                emailAgreed: Boolean(formData.emailAgreed),
            })
            
            toast.success('회원가입이 완료되었습니다!')
            navigate('/login')
        } catch (error) {
            console.error('회원가입 실패:', error)
            toast.error('회원가입에 실패했습니다. 다시 시도해주세요.')
        } finally {
            setLoading(false)
        }
    }

    // ======================================================
    // 렌더링
    // ======================================================
    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-orange-100">
                <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                    회원가입
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="아이디"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        placeholder="아이디 (4자 이상)"
                        error={errors.userId}
                    />

                    <Input
                        label="사용자명"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="사용자명 (2자 이상)"
                        error={errors.username}
                    />

                    <Input
                        label="이메일"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        error={errors.email}
                    />

                    <Input
                        label="비밀번호"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="비밀번호 (6자 이상)"
                        error={errors.password}
                    />

                    <Input
                        label="비밀번호 확인"
                        name="passwordConfirm"
                        type="password"
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        placeholder="비밀번호 확인"
                        error={errors.passwordConfirm}
                    />

                    <Input
                        label="전화번호"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="010-1234-5678"
                        error={errors.phone}
                    />

                    <label className="flex items-start gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="emailAgreed"
                            checked={formData.emailAgreed}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, emailAgreed: e.target.checked }))
                            }
                            className="mt-1"
                        />
                        <span>이메일로 정보·마케팅 메일 수신에 동의합니다. (필수 서비스 안내 메일과 별개입니다.)</span>
                    </label>

                    <Button
                        type="submit"
                        className="w-full mt-2"
                        disabled={loading}
                    >
                        {loading ? '가입 중...' : '회원가입'}
                    </Button>
                </form>

                <p className="text-center mt-6 text-gray-700">
                    이미 계정이 있으신가요?{' '}
                    <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        로그인
                    </Link>
                </p>
            </div>
        </div>
    )
}