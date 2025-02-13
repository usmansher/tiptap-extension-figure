/**
 * Scopes the provided CSS by appending the given scope to each selector.
 *
 * @param css - The CSS string to be scoped.
 * @param scope - The scope to append to each selector.
 * @returns The scoped CSS string.
 */
export const scopeCss = (css: string, scope: string): string => {
  const regExp = /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g;
  return css.replace(regExp, `$1${scope}$2`);
};
