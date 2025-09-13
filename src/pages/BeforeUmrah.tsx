import steps from "../data/umrah.json";

const BeforeUmrah = () => {
  const filteredSteps = steps.steps.filter((step) =>
    ["before"].includes(step.phase)
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>قبل العمره</h1>

      {filteredSteps.map((step) => (
        <div
          key={step.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2 style={{ marginBottom: "10px", color: "#2c3e50" }}>
            {step.title}
          </h2>

          {step.description.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              {step.description.map((desc, i) => (
                <p key={i} style={{ margin: "5px 0" }}>
                  {desc}
                </p>
              ))}
            </div>
          )}

          {step.dua.length > 0 && (
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              {step.dua.map((d, i) => (
                <li key={i} style={{ marginBottom: "5px", color: "#16a085" }}>
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default BeforeUmrah;
