import kakaoLoginImage from '../assets/kakao_login_large_wide.png';

export interface KakaoLoginButtonProps {
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

// v1.6 카카오 버튼: 카카오가 제공하는 공식 버튼 이미지(600×90)를 높이 45px로 쓴다.
// 이미지 자체가 버튼 모양이라 색과 글자를 따로 입히지 않는다.
export function KakaoLoginButton({ onClick, loading = false, className }: KakaoLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading || undefined}
      aria-label="카카오 로그인"
      className={['relative inline-flex h-[45px] items-center justify-center', className].filter(Boolean).join(' ')}
    >
      <img src={kakaoLoginImage} alt="" className={['h-[45px] w-auto', loading && 'opacity-60'].filter(Boolean).join(' ')} />
      {loading ? (
        <span
          aria-hidden="true"
          className="absolute size-5 animate-spin rounded-pill border-2 border-current border-r-transparent motion-reduce:animate-none"
        />
      ) : null}
    </button>
  );
}
