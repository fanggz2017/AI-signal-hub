# Git 提交规范 (Git Commit Convention)

本项目采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，并使用 `husky` + `commitlint` 进行强制校验。

## 提交格式

```
<type>(<scope>): <subject>
```

### Type (必需)

| 类型 | 描述 | 示例 |
| :--- | :--- | :--- |
| **feat** | 新增功能 (Feature) | `feat: 增加用户登录功能` |
| **fix** | 修复 Bug | `fix: 修复验证码校验逻辑` |
| **docs** | 文档变更 | `docs: 更新 README.md` |
| **style** | 代码格式调整 (不影响逻辑) | `style: 调整代码缩进` |
| **refactor** | 代码重构 (无新功能/Bug修复) | `refactor: 重构 auth service` |
| **perf** | 性能优化 | `perf: 优化数据库查询` |
| **test** | 测试相关 | `test: 添加登录单元测试` |
| **build** | 构建系统/依赖变更 | `build: 升级 bun 版本` |
| **ci** | CI/CD 配置变更 | `ci: 更新 github actions` |
| **chore** | 其他杂项 (构建过程或辅助工具) | `chore: 清理临时文件` |
| **revert** | 回滚提交 | `revert: 回滚 feat: xxx` |

### Scope (可选)

用于说明 commit 影响的范围，例如：
*   `feat(api): ...`
*   `fix(web): ...`
*   `chore(core): ...`

### Subject (必需)

简短描述本次变更的内容，以动词开头，使用现在时。

## 示例

*   ✅ `feat(auth): add login api`
*   ✅ `fix(ui): fix button color on hover`
*   ✅ `docs: update deployment guide`
*   ❌ `update login` (缺少 type)
*   ❌ `Fixed bug` (Type 不规范)

## 工具支持

提交时会自动运行 `commitlint` 检查。如果不符合规范，提交将被拒绝。
