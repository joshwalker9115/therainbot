import ReactTable from 'react-table';
import React, { Component } from 'react';
import axios from 'axios';
import 'react-table/react-table.css';

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


class Subtable extends Component {
    constructor(props) {
      super(props);
      this.state = {
        data: [],
        stationID: this.props.stationID,
        today: this.props.today //change this to inherit date
      };
      console.log("check this:", this.state.today)
      this.formatData = this.formatData.bind(this);
      this.getData = this.getData.bind(this);
    }

    getData = () => {  //this should setState to loading true when triggered because data is being fetched
      try {
        const urlBase = "https://morning-retreat-23014.herokuapp.com/https://www.wunderground.com/weatherstation/WXDailyHistory.asp?ID=";
        const stationID = this.props.stationID; //import from Table state? row/subtable state?
        // const yesterday = this.state.today.setDate(-1);
        const todayY = this.state.today.getFullYear();
        const todayM = this.state.today.getMonth()+1;
        const todayD = this.state.today.getDate();
        // const yesterdayY = yesterday.getFullYear();
        // const yesterdayM = yesterday.getMonth(+1);
        // const yesterdayD = yesterday.getDate();
        const url = `${urlBase}${stationID}&tablespan=day&month=${todayM}&day=${todayD}&year=${todayY}&format=1`
        console.log(url);

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
    
    formatData = async () => {
      let pulledData = [];
      const stationID = this.props.stationID;
      const rawData = this.getData()
        .then(response => {
          if (response.data) {
            pulledData = response.data;
            pulledData = pulledData.replace(/[<]br[^>]*[>]/gi,"");
            pulledData = pulledData.replace(/^\s*\n/gm, "");
            pulledData = csv.parse(pulledData);
            console.log(pulledData);
            this.setState({data: pulledData});
          }
        })
        .catch(error => {
          console.log(error)
        })
    }

    componentDidMount() {
      this.formatData();
    }

    render() {
      const { data } = this.state;
      console.log(data);
      return (
        <div>
          <ReactTable
            data={data}
            columns={[
            {
                Header: 'Time',
                accessor: 'Time'
            }, {
                Header: 'Hourly Precipitation',
                accessor: 'HourlyPrecipIn'
            }, {
                Header: 'Daily Total',
                accessor: 'dailyrainin'
            }
            ]}
            defaultSorted={[
              {
                id: "Time",
                desc: true
              }
            ]}
            showPagination={true}
            defaultPageSize={this.state.length}
            style={{
                height: "400px" // This will force the table body to overflow and scroll, since there is not enough room
              }}
            className="-striped -highlight"
          />
        </div>
      );   
    }
  }
  
  export default Subtable;