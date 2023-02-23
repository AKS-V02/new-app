import logo from './logo.svg';
import './App.css';

function App() {

  function onclickfunction(){

    alert(`environmet is ${process.env.USER_BRANCH}`);
  }


  return (
    <div className="App">
      new App
      <p>{process.env.USER_BRANCH}</p>
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
