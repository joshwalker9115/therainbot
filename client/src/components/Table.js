import ReactTable from 'react-table';
import React, { Component } from 'react';
import Subtable from './Subtable';
import axios from 'axios';
import 'react-table/react-table.css'; //test

//unneccasary test data
/*{
          jobName: "otherTest",
          stationID: "KWVFALLI8",
          yesterdayP: "0.01",
          todayP: "0.98",
          totalP: "0.99"
        }*/

class Csv {
  parseLine(text) {
    const regex =
    /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    let arr = [];
    text.replace(regex, (m0, m1, m2, m3) => {
      if (m1 !== undefined) {
        arr.push(m1.replace(/\\'/g, "'"));
      } else if (m2 !== undefined) {
        arr.push(m2.replace(/\\"/g, "\""));
      } else if (m3 !== undefined) {
        arr.push(m3);
      }
      return "";
    });
    if (/,\s*$/.test(text)) {
      arr.push("");
    }
    return arr;
  }

  zipObject(props, values) {
    return props.reduce((prev, prop, i) => {
      prev[prop] = values[i];
      return prev;
    }, {});
  }

  parse(csv) {
    let [properties, ...data] = csv.split("\n").map(this.parseLine);
    return data.map((line) => this.zipObject(properties, line))
  };

  serialize(obj) {
    let fields = Object.keys(obj[0]);
    let csv = obj.map(row => fields.map((fieldName) => JSON.stringify(row[fieldName] || "")));
    return [fields, ...csv].join("\n");
  }; 
}

const csv = new Csv();

class Table extends Component {
    constructor(props) {
      super(props);
      this.state = {
        //PPs: this.props.PPs, //most likely wont set to state, just use componentDidUpdate below and if=> update!
        data: [],
        yesterdayDate: '',
        todayDate: '',
        today: new Date()
      };
      this.formatData = this.formatData.bind(this);
      this.getData = this.getData.bind(this);
    }

    getData = (stationID) => {
      try {
        const urlBase = "https://www.wunderground.com/weatherstation/WXDailyHistory.asp?ID=";
        const today = this.state.today;
        //const yesterday = today.setDate(today.getDate() -1);
        const yesterday = new Date(new Date().setDate(new Date().getDate()-1));
        const todayY = today.getFullYear();
        const todayM = today.getMonth()+1;
        const todayD = today.getDate();
        const yesterdayY = today.getFullYear();
        const yesterdayM = yesterday.getMonth()+1;
        const yesterdayD = yesterday.getDate();
        const url = `${urlBase}${stationID}&day=${yesterdayD}&month=${yesterdayM}&year=${yesterdayY}&dayend=${todayD}&monthend=${todayM}&yearend=${todayY}&graphspan=custom&format=1`;
        return axios({
          method:'get',
          url:url,
          headers: {
              Accept:'text/html',
              'Content-Type': 'text/html'
              },
        })
      } catch (error) {
        console.error(error)
      }
    }
    
    formatData = async (PPs) => {
      //this.setState({ data: [] }); //if going to use this, ensure the rest of this function is the callback!
      console.log("formatData() called")
      let pulledData = [];
      //const stationID = this.state.data[0].stationID;
      PPs.map( PP => this.getData(PP.stationID) //map over array of SIDs here
        .then(response => {
          if (response.data) {
            pulledData = response.data; //turn this into a function
            pulledData = pulledData.replace(/[<]br[^>]*[>]/gi,"");
            pulledData = pulledData.replace(/^\s*\n/gm, "");
            pulledData = pulledData.trim();
            pulledData = csv.parse(pulledData);
            this.setState({
              ...this.state,
              data: [...this.state.data,
                {
                jobName: PP.jobName,
                stationID: PP.stationID,
                yesterdayP: pulledData[0].PrecipitationSumIn,
                todayP: pulledData[1].PrecipitationSumIn,
                totalP: (+pulledData[0].PrecipitationSumIn + +pulledData[1].PrecipitationSumIn).toFixed(2)}],
                todayDate: pulledData[1].Date, //will likely get taken out and passed from a date selector
                yesterdayDate: pulledData[0].Date, //will likely get taken out and passed from a date selector
                }//,
            // () => this.setState({...this.state, data: [...(new Set(this.state.data))]})
            ); //a lot of unnecessary callbacks, remove here and in component didUpdate to fix
          }
          //add an elseif statement to catch error of not reporting.  would ===
/*
Date,TemperatureHighF,TemperatureAvgF,TemperatureLowF,DewpointHighF,DewpointAvgF,DewpointLowF,HumidityHigh,HumidityAvg,HumidityLow,PressureMaxIn,PressureMinIn,WindSpeedMaxMPH,WindSpeedAvgMPH,GustSpeedMaxMPH,PrecipitationSumIn<br>
*/
        })
        .catch(error => {
          console.log(error)
        })
      )
    }

  //   componentWillMount() {
  //     this.props.getData()
  // }

    // componentWillReceiveProps(props) {
    //   this.setState({...this.state, PPs: [...this.state.PPs, ...props.PPs]},
    //     function() {this.formatData()});
    // }

    componentDidUpdate(prevProps, prevState) {
      if(this.props !== prevProps) {
        if (this.props.PPs === []) {this.setState({data: []})}
        else {
          console.log("going to update with formatData()", this.props.PPs);
          this.setState({data: []},
            () => this.formatData(this.props.PPs, () => {
              console.log("testing", this.props.PPs, this.state.data)
            }));
        }
      }
    }
    
    // componentDidMount() {
    //   this.formatData();// here is where we should map over a state based list of stations
    // }

    render() {
      // const stationID = stationID; //import from Table state? row/subtable state?
      const { data, today } = this.state;
      //const stationID = this.state.data[0].stationID;
      //console.log(stationID);
      const { todayDate } = this.state;
      const yesterday = new Date(new Date().setDate(new Date().getDate()-1));
      const baseURL = "https://www.wunderground.com/weatherstation/WXDailyHistory.asp?ID=";
      const tailURL = `&day=${yesterday.getDate()}&month=${yesterday.getMonth()+1}&year=${yesterday.getFullYear()}&dayend=${today.getDate()}&monthend=${today.getMonth()+1}&yearend=${today.getFullYear()}&graphspan=custom&format=1`;
      return (
        <div>
          <ReactTable
            data={data}
            columns={[
            {
              Header: 'Job Name',
              accessor: "jobName"
            }, {
              Header: 'Station',
              accessor: "stationID",//add <a href wunderground here>
              Cell: d =><a href={`${baseURL}${d.value}${tailURL}`}> {d.value} </a>
            }, {
              Header: this.state.yesterdayDate,
              accessor: "yesterdayP",
              //can you use...  Cell: d => if(d===undefined/null) {return yellow error triangle?}
            }, {
              Header: this.state.todayDate,
              // id: "PrecipitationSumIn1",
              accessor: "todayP"
            }, {
              Header: 'Total Precipitation',
              // id: "PrecipitationSumIn2",
              accessor: "totalP",
              Cell: d => d >= 0.50 ? <div style={{width: '100%', height: '100%', backgroundColor: '#FF0000'}}> {d.value} </div> : <div>{d.value}</div>
            }
          ]}

            defaultSorted={[
              {
                id: "jobName",
                desc: false
              }
            ]}
            showPagination={false}
            defaultPageSize={this.state.length}
            style={{
                height: "600px" // This will force the table body to overflow and scroll, since there is not enough room
              }}
            className="-striped -highlight"
            SubComponent={row => {
              return (
                <div>
                  <Subtable stationID={row.original.stationID} today={today}/>
                </div>
              );
            }}
          />
        </div>
      );   
    }
  }

// ShoppingList.propTypes = {
//     getData: PropTypes.func.isRequired,
//     data: PropTypes.object.isRequired
// }

// const mapStateToProps = (state) => ({
//     data: state.data
// });

// export default connect(mapStateToProps, { getData })(Table);

export default Table;