import logo from './logo.svg';
import './App.css';
import { envVar } from './envVar';

function App() {
  const abs = envVar[process.env.REACT_APP_Environment];

  function onclickfunction(){

    alert("environmet is "+process.env.REACT_APP_Environment);
  }


  return (
    <div className="App">
      new App
      <p>{process.env.REACT_APP_ID}</p>
      <p>{abs.somting}</p>
      <p>{abs.dothing}</p>
      <button
            type="button"
            className=""
            onClick={onclickfunction}>
                Check Environment
            </button>
    </div>
  );
}

export default App;
