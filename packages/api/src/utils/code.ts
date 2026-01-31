/**
 * 生成验证码
 */
export const generateCode = (length = 6) => {
  return Math.random()
    .toString()
    .slice(2, 2 + length);
};
