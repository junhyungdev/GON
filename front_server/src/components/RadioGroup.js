import RadioContext from "./RadioContext";

function RadioGroup({ label, children, ...rest }) {
  return (
    <fieldset>
      <legend>{label}</legend>
      <RadioContext.Provider value={rest}>{children}</RadioContext.Provider>
    </fieldset>
  );
}
export default RadioGroup;
