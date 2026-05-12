import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '@/api/authApi';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AutoContext.jsx';

export default function EmailConsentPage() {
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(Boolean(user?.emailAgreed));

    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto mt-10 text-center text-slate-600">
                <Link to="/login" className="text-emerald-600 hover:underline">
                    로그인
                </Link>
            </div>
        );
    }

    const save = async () => {
        try {
            setLoading(true);
            await authApi.updateEmailConsent({ emailAgreed: agreed });
            toast.success('저장되었습니다.');
            const next = { ...user, emailAgreed: agreed };
            localStorage.setItem('user', JSON.stringify(next));
            window.location.reload();
        } catch {
            /* */
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
            <h1 className="text-xl font-bold text-slate-800 mb-4">이메일 수신 동의</h1>
            <p className="text-sm text-slate-600 mb-4">
                마케팅·정보 메일 수신 여부입니다. 직원 계정 발급 등 필수 안내 메일과는 별도입니다.
            </p>
            <label className="flex items-center gap-2 mb-6 text-sm">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                이메일 수신에 동의합니다.
            </label>
            <div className="flex gap-2">
                <Button type="button" className="flex-1" disabled={loading} onClick={save}>
                    {loading ? '저장 중...' : '저장'}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => (window.location.href = '/')}>
                    취소
                </Button>
            </div>
        </div>
    );
}
