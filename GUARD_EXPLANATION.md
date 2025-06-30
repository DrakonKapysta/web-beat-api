# Как работает Guard в NestJS

## Основные принципы

### 1. Интерфейс CanActivate

```typescript
interface CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
```

**Логика работы:**

- `return true` → запрос проходит к контроллеру
- `return false` → NestJS возвращает 403 Forbidden
- `throw UnauthorizedException()` → NestJS возвращает 401 Unauthorized

### 2. ExecutionContext

Это объект, который содержит информацию о текущем запросе:

```typescript
const request = context.switchToHttp().getRequest();
const response = context.switchToHttp().getResponse();
```

## Сравнение подходов

### Passport Guard (AuthGuard)

```typescript
@UseGuards(JwtCombineAuthGuard)
// Наследует от AuthGuard(['jwt', 'jwt-cookie'])
```

**Плюсы:**

- Готовые стратегии для разных типов аутентификации
- Автоматическая обработка ошибок
- Стандартизированный подход
- Поддержка множественных стратегий

**Минусы:**

- Более сложная настройка
- Дополнительная абстракция
- Зависимость от Passport.js

**Как работает:**

1. AuthGuard пробует стратегии по очереди
2. Каждая стратегия ищет токен в своем месте
3. Если токен найден и валиден, вызывается `validate()`
4. Результат помещается в `request.user`

### Custom Guard

```typescript
@UseGuards(CustomJwtGuard)
// Реализует CanActivate напрямую
```

**Плюсы:**

- Полный контроль над логикой
- Простота понимания
- Нет лишних зависимостей
- Легкая кастомизация

**Минусы:**

- Нужно писать всю логику самому
- Обработка ошибок на вас
- Нет готовых стратегий

**Как работает:**

1. Извлекаем токен из запроса
2. Проверяем токен через JwtService
3. Помещаем payload в `request.user`
4. Возвращаем true/false

## Практические примеры

### 1. Простая валидация токена

```typescript
// GET /auth/validate - использует Passport
// GET /auth/validate-custom - использует Custom Guard

// Оба endpoint'а делают одно и то же, но разными способами
```

### 2. Тестирование через curl

**Bearer Token:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:3000/auth/validate
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:3000/auth/validate-custom
```

**Cookie:**

```bash
curl -b "access_token=YOUR_TOKEN_HERE" http://localhost:3000/auth/validate
curl -b "access_token=YOUR_TOKEN_HERE" http://localhost:3000/auth/validate-custom
```

### 3. Клиентский код

```javascript
// Проверка через Passport Guard
const testPassportGuard = async () => {
	const token = localStorage.getItem('access_token');
	const response = await fetch('/api/auth/validate', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.json();
};

// Проверка через Custom Guard
const testCustomGuard = async () => {
	const token = localStorage.getItem('access_token');
	const response = await fetch('/api/auth/validate-custom', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.json();
};
```

## Выбор подхода

### Используйте Passport когда:

- Нужны различные типы аутентификации (JWT, OAuth, Local)
- Хотите стандартизированное решение
- Планируете расширять систему аутентификации

### Используйте Custom Guard когда:

- Нужна специфическая логика валидации
- Хотите минимальные зависимости
- Нужен полный контроль над процессом
- Простые требования к аутентификации

## Возможные улучшения Custom Guard

```typescript
// Можно добавить:
// 1. Кеширование валидации
// 2. Rate limiting
// 3. Логирование попыток доступа
// 4. Blacklist токенов
// 5. Проверку ролей и прав доступа
// 6. Refresh token логику
```
