const options = [
  {
    value: "custom",
    option: "OPTION 01",
    title: "여행 경비 설정하기",
    description: "내가 사용할 여행 경비를 직접 설정합니다.",
  },
  {
    value: "none",
    option: "OPTION 02",
    title: "여행 경비 설정 안 함",
    description: "패키지 예상 경비만 확인하고 별도의 여행 경비는 설정하지 않습니다.",
  },
];

export default function BudgetOptionCards({ value, onChange }) {
  return (
    <div>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <label key={option.value}>
            <input
              type="radio"
              name="budget-option"
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
            />
            <span>
              <small>{option.option}</small>
              <strong>{option.title}</strong>
              <em>{option.description}</em>
            </span>
          </label>
        );
      })}
    </div>
  );
}
