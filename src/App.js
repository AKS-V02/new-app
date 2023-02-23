import logo from './logo.svg';
import './App.css';

function App() {
  const abs = process.env.REACT_APP_USER_BRANCH;

  function onclickfunction(){

    alert("environmet is "+abs);
  }


  return (
    <div className="App">
      new App
      <p>{process.env.REACT_APP_COMPANY}</p>
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
