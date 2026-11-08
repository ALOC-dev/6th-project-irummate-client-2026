import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TextField } from './TextField';

describe('TextField', () => {
  it('레이블과 도움말을 입력 필드에 연결한다', () => {
    render(<TextField label="학번" helperText="10자리 숫자" />);

    const input = screen.getByLabelText('학번');
    const helper = screen.getByText('10자리 숫자');
    expect(input).toHaveAccessibleDescription('10자리 숫자');
    expect(helper).toHaveAttribute('id');
  });

  it('오류 상태를 접근성 속성으로 전달한다', () => {
    render(<TextField label="학번" errorMessage="학번을 확인해 주세요" />);

    const input = screen.getByLabelText('학번');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('학번을 확인해 주세요');
  });
});
