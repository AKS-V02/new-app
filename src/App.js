import logo from './logo.svg';
import './App.css';

function App() {
  const abs = process.env.USER_BRANCH;

  function onclickfunction(){

    alert("environmet is "+abs);
  }


  return (
    <div className="App">
      new App
      <p>{process.env._CUSTOM_IMAGE}</p>
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
