# AI 리믹스

`remixPlan`은 로그인한 사용자의 `plans/{planId}`를 읽고 OpenAI Responses API로 최대 2개 변경안을 생성합니다. 원본은 저장하지 않으며 일정 수정 화면의 저장에서 적용합니다.

## 준비

프로젝트 루트 PowerShell에서 실행합니다. 키를 명령어 인자나 채팅에 입력하지 말고 CLI의 비밀 입력란에 입력합니다.

```powershell
firebase.cmd functions:secrets:set OPENAI_API_KEY --project lcode-dev
firebase.cmd deploy --only functions:remixPlan --project lcode-dev
```

로컬에서는 `functions/.secret.local.example`을 `functions/.secret.local`로 복사 후 키를 직접 입력합니다. 프론트 `.env.local`에 `VITE_USE_FUNCTIONS_EMULATOR=true`를 추가하고 Vite를 다시 시작합니다.

```powershell
firebase.cmd emulators:start --only functions --project lcode-dev
```

Functions만 에뮬레이션하면 인증/Firestore는 실제 프로젝트를 사용합니다. 리믹스 캐시·사용량 문서가 생성되며 실제 OpenAI 호출은 유료입니다. `remixRequests`, `remixUsage`는 기존 Firestore 기본 거부 규칙으로 클라이언트 접근이 금지됩니다.

## 비용과 제한

- 모델 `gpt-5.4-nano`, 추론 low, 과금 출력 최대 1,200토큰, 자동 재시도 없음.
- 후보 최대 5개, 변경 최대 2개. 항공·역·호텔·잠금·예약·완료 장소 보호.
- 사용자 하루 3회, 프로젝트 하루 100회. UTC 자정 초기화. 실패한 유료 요청도 횟수에 포함.
- 같은 사용자/일정/원본 버전/상황/날짜/후보는 15분 재사용. 동시 중복은 차단.
- `minInstances: 0`, `maxInstances: 2`. 일일 횟수 제한은 OpenAI 요청 제한이며 전체 Firebase 요금 상한이 아닙니다.
- `remixRequests`와 `remixUsage`는 서버 전용입니다. 장기 운영 시 만료 문서 정리/TTL 정책을 별도로 설정하세요.

## 현재 범위

비/문닫힘: 보유 데이터의 장소 교체. 피곤함/딜레이/자동: 우선순위 낮은 장소 제거. 교통/비용: 근거가 있는 후보가 없으면 원본 유지. 시간 이동, 다음 날 이동, 실시간 지도/날씨/영업 검증은 포함하지 않습니다.

장소 카탈로그는 저장소의 여행 데이터에서 생성합니다. 실내 태그는 박물관·미술관·수족관 명칭 기반 초기 분류이므로 운영 전에 검수하세요. 도시별 적합 후보가 없으면 변경하지 않습니다. 변경된 이동 구간에는 기존 소요 시간을 재사용하지 않습니다.

```powershell
node functions/build-remix-catalog.cjs
node --test functions/remix-core.test.js
```

배포 후 본인의 저장된 일정으로 비/문닫힘, 동일 요청 재사용, 일일 한도, 키 오류를 확인하세요. 오류 시 가짜 결과를 표시하지 않고 원본을 유지합니다.
