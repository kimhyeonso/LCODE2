export async function requestRecommendation(form) {
  // TODO: 배포 단계에서 브라우저가 아닌 Serverless Function을 통해 OpenAI API와 연결합니다.
  await new Promise((resolve) => setTimeout(resolve, 900));
  const place = form.destination.trim() || "새로운 도시";
  return {
    title: `${place}, 당신의 속도로`,
    intro: `${form.duration} 동안 ${form.interest}에 집중한 ${form.people}인 여행입니다. 이동을 줄이고 머무는 감각을 살렸어요.`,
    schedule: [
      {
        title: "낯선 도시와 천천히 인사하기",
        detail:
          "체크인 후 오래된 동네를 걷고 작은 식당에서 첫 저녁을 시작합니다.",
      },
      {
        title: `${form.interest}의 장면 수집하기`,
        detail: "오전의 대표 장소와 오후의 로컬 스폿을 여유 있게 연결합니다.",
      },
      {
        title: "다시 오고 싶은 이유 남기기",
        detail: "시장과 공원을 들른 뒤 비워 둔 시간으로 여행을 마무리합니다.",
      },
    ],
  };
}
