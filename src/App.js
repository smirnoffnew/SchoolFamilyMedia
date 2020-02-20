import React, {useState} from 'react';
import axios from "axios";

const API_KEY = '210f1d1b-a5b6-48be-b30b-e3f44e2c6da7'
const API_Domain = 'https://api.candidate.schoolfamilymedia.com'

const ObjectStateFactory = (data, isArray) => {
  const DataResult = {}
  data.forEach(el => {
    DataResult[el.state] = isArray ? [] : {}
  })
  return DataResult;
}

function App() {

  const [list, setList] = useState();
  const [dataForPost, setDataForPost] = useState();
  const [postResponse, setPostResponse] = useState();

  const postData = () => {
    axios.post(`${API_Domain}/assessments/results/5e4d7467447f254bbda26ff0?apiKey=${API_KEY}`, dataForPost)
      .then(response => {
        setPostResponse(response.success)
      })
      .catch(error => {
        console.log(error);
      });
  }

  const SortData = () => {

      const DataResult = ObjectStateFactory(list);
      const DataMass = ObjectStateFactory(list,true);
      let PostData = [];
  
      list.forEach(element => {
        element.availability.forEach(availability => {
          DataResult[element.state].hasOwnProperty(availability) 
          ?
            DataResult[element.state][availability].push(element.email)
          :
            DataResult[element.state][availability] = [element.email]
        })
      })
  
      for(let state in DataResult){
        for(let date in DataResult[state]){
          DataMass[state].push({length: DataResult[state][date].length, date: date})
        }
      }
  
      for(let state in DataResult){
        DataMass[state].sort((a, b) => {
          if (a.length < b.length) {
            return 1;
          }
          if (a.length > b.length) {
            return -1;
          }
          return 0;
        });
      }
      
      for(let state in DataResult){
        PostData.push({
          state,
          bestDates: [
              {
                date: DataMass[state][0].date,
                attendees: DataResult[state][DataMass[state][0].date],
              }
            ]
        })
      }

      setDataForPost(PostData)
  }

  const getData = () => {
    axios.get(`${API_Domain}/assessments/poll/5e4d7467447f254bbda26ff0?apiKey=${API_KEY}`)
      .then(({ data }) => { setList(data) });
  }

  return (
    <div className="App">
      <button onClick={getData}>Get Data</button>
      {list && <button onClick={SortData}>Sort Data</button>}
      {list && dataForPost && <button onClick={postData}>Post Data</button>}

      <table>
          {list && list.map(el => {
           return <tr>
              <td>{el.firstName}</td>
              <td>{el.lastName}</td>
              <td>{el.email}</td>
              <td>{el.state}</td>
              <td>{el.availability.map(item => <div>{item}</div>)}</td>
            </tr>
          })}
      </table>

      <table>
        {dataForPost && dataForPost.map(el => {
          return <tr>
              <td>{el.state}</td>
              <td>{el.lastName}</td>
              <td>{el.email}</td>
              <td>{el.state}</td>
              <td>{el.bestDates.map(item => {
                return(
                  <>
                    <div>{item.date}</div>
                    {item.attendees.map(attendees => <div>{attendees}</div>)}
                  </>
                )
              })}</td>
            </tr>
          })}
      </table>

      {postResponse && <div>Response: {postResponse}</div>}
    </div>
  );
}

export default App;
