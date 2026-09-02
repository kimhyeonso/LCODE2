# 관리자 계정 설정

관리자 화면은 `/admin`이며 Firebase Authentication과 Firestore의 `users/{uid}.role`을 함께 확인합니다.

1. 앱의 회원가입 화면에서 관리자용 이메일로 먼저 가입합니다.
2. Firebase Console → Firestore Database → `users` → 해당 사용자의 UID 문서를 엽니다.
3. 문자열 필드 `role` 값을 `user`에서 `admin`으로 변경합니다.
4. 이 저장소에서 `firebase deploy --only firestore:rules`를 실행해 보안 규칙을 배포합니다.
5. 다시 로그인한 뒤 `/admin`으로 이동합니다.

최초 관리자 지정은 반드시 Firebase Console처럼 신뢰할 수 있는 환경에서 수행해야 합니다. 일반 회원이 클라이언트에서 자신의 `role`을 변경하는 것은 Firestore 규칙으로 차단됩니다.
