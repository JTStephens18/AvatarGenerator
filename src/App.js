import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from "react";
import { hasSelectionSupport } from '@testing-library/user-event/dist/utils';
import { mintContract } from './constants';
import mintAbi from './artifacts/contracts/Mint.sol/Mint.json';
import { ethers } from 'ethers';

function App() {

  // const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [image, setImage] = useState(null);
  const [loadTime, setLoadTime] = useState(0);
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(-1);
  const maxRetries = 10;

  const [promptInput, setPromptInput] = useState({
    style: "",
    artist: "",
    medium: "",
    details: ""
  });

  const [finalPrompt, setFinalPrompt] = useState("");

  const [currAccount, setCurrAccount] = useState("");
  const [contract, setContract] = useState(null);

  const [test, setTest] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please install Metamask");
      return;
    } else {
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      const account = accounts[0];
      setCurrAccount(account);
      console.log("account: ", account);
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(mintContract, mintAbi.abi, signer);
      setContract(contract);
    }
  }

  const handleInput = async (e, property) => {
    setPromptInput({
      ...promptInput,
      [property]: e.target.value
    });
  };

  const bufferToBase64 = (buffer) => {
    let arr = new Uint8Array(buffer);
    const base64 = btoa(
      arr.reduce((data, byte) => data +  String.fromCharCode(byte), '')
    )
    return `data:image/png;base64,${base64}`;
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  useEffect(() => {
    const runRetry = async () => {
      console.log("retrying");
      if(retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Please try again in 5 minutes.`);
        setRetryCount(maxRetries);
        return;
      }

      await sleep(loadTime * 1000);
      await generateImage();
    };

    if(loadTime === 0) {
      return;
    }

    runRetry();

  }, [loadTime]);


  const generateImage = async (req, res) => {
    console.log("Request received");

    const prompt = "Justephens " + promptInput.style + " character portrait in the style of " + promptInput.artist + " " + promptInput.medium + " " + promptInput.details;
    console.log("prompt: ", prompt);

    if (loadTime > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setLoadTime(0);
    }

    // const input = JSON.parse(req.body).input;
    // const input = JSON.parse(prompt);

    const response = await fetch(
      `https://api-inference.huggingface.co/models/JTStephens/sd-1-5-justephens`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_HUGGINGFACE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        // mode: 'no-cors',
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
        }),
      }
    );

      if(response.ok) {
        setIsLoading(true);
        const buffer = await response.arrayBuffer();
        // res.status(200).json({image: buffer});
        const base64 = bufferToBase64(buffer);
        setImage(base64);
        setFinalPrompt(prompt);

        setIsLoading(false);
        var tester = JSON.stringify(buffer);
        setTest(tester);
        console.log("tester: ", tester);

      } else if (response.status === 503) {
        const json = await response.json();
        console.log("503", json);
        setLoadTime(json.estimated_time);
        // res.status(503).json({error: json.error});
      } else {
        const json = await response.json();
        console.log("other: ", response.statusText, "json ", json);
        // res.status(response.status).json({error: response.statusText});
      }

      setResult(res);
      console.log("End of function");
  };

  const mintNFT = async () => {
    try {
      const mintTx = await contract.mint(currAccount, finalPrompt, image, {gasLimit: 3000000});
      await mintTx.wait();
      console.log("mint: ", mintTx);
    } catch (error) {
      console.log("error minting NFT", error);
    }
  };

  const convertImage = () => {
    console.log("image: ", image);
    var test = image.replace("data:image/png;base64,/", "");
    // var binary = atob(test);
    var json = JSON.parse(test);
    // console.log("binary: ", binary);
    console.log("json: ", json);
  }

  return (
    <div className="App">
      <div className="main-container">
      <h1 className="title">Generate an AI image of me!</h1>
      <div className="main-content">
        <div className="input-group">
          <div className="style-container">
            <h5 className="input-header">Style</h5>
            <input 
              type="text"
              placeholder="Fantasy, surrealism, contemporary, etc.. "
              onChange={(e) => handleInput(e, "style")}
              className="input-field"
            />
          </div>
          <div className="medium-container">
            <h5 className="input-header">Medium</h5>
            <input 
              type="text"
              placeholder="Oil, pencil, watercolor, digital, etc.."
              onChange={(e) => handleInput(e, "medium")}
              className="input-field"
            />
          </div>
          <div className="artist-container">
            <h5 className="input-header">Artist</h5>
            <input 
              type="text"
              placeholder="Picasso, Van Gogh, Da Vinci, etc.."
              onChange={(e) => handleInput(e, "artist")}
              className="input-field"
            />
          </div>
          <div className="details-container">
            <h5 className="input-header">Details</h5>
            <input 
              type="text"
              placeholder="Extra details"
              onChange={(e) => handleInput(e, "details")}
              className="input-field"
            />
          </div>
          <div className="submit-btn-container">
            {!isLoading ? (
              <button className="submit-btn btn" onClick={() => generateImage()}>Generate</button>
            ) : (
              <div></div>
            )}
            {/* {image && ( */}
              {/* <button onClick={() => mintNFT()}className="mint-btn btn">Mint</button> */}
            {/* )} */}
          </div>
        </div>
        <div className="img-group">
          {image && (
            <div className="img-group-inside">
              <img
                height="256"
                width="256"
                src={image}
                alt="ai portrait"
                className="img-container"
              />
              <div>
              {/* <p className="img-description">{`Justephens ${promptInput.style} ${promptInput.artist} ${promptInput.medium} ${promptInput.details}`}</p> */}
              {/* <p className="img-description">{finalPrompt}</p> */}
              {/* <button onClick={() => mintNFT()}className="mint-btn btn">Mint</button>
              <button onClick={() => convertImage()}>Log</button> */}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
