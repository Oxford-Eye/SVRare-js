import * as React from "react";
import { Link } from "react-router-dom";
//import MaterialIcon from "@material/react-material-icon";
import axios from "axios";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import "../styles/Families.css";

interface Family {
  familyId: string;
  link: string;
  show: boolean;
}

interface State {
  families: Family[];
  searchString: string;
}
interface Props {
  baseUrl: string;
}

class Families extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchString: "",
      families: [
        {
          familyId: "",
          link: "",
          show: false,
        }
      ]
    };
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // update value of cutoffs
    const { value } = e.currentTarget;
    this.setState({
      searchString: value
    });
  };

  componentDidMount() {
    const url = (this.props.baseUrl ? this.props.baseUrl : "") + '/families';
    axios.get(url).then(res => {
      this.setState({
        families: res.data.data
          .sort((a: Family, b: Family) => {
            // sort collections
            if (a.familyId < b.familyId) {
              return -1;
            }
            return 1;
          })
          .map((s: Family) => {
            // set state
            return {
              familyId: s.familyId,
              link: `/patient_sv?familyId=${s.familyId}&pageSize=30&page=0`,
              show: true
            };
          })
      });
    });
  }
  render() {
    const { searchString, families } = this.state;
    return (
      <React.Fragment>
        <div className="search-bar">
          <TextField
            label="Search field"
            type="search"
            margin="normal"
            onChange={this.onChange}
            value={this.state.searchString}
          />
        </div>
        <div className="main">
          {families.map(family => {
            if (
              !searchString ||
              family.familyId
                .toLocaleLowerCase()
                .indexOf(searchString.toLocaleLowerCase()) !== -1
            ) {
              return (
                <Card key={family.familyId} className="card">
                  <CardContent>
                    <div className="card-div">
                      <Typography variant="h6">{family.familyId}</Typography>
                    </div>
                    <Typography variant="body2">
                      <Link to={family.link}>Click to see details</Link>
                    </Typography>
                  </CardContent>
                </Card>
              );
            } else {
              return;
            }
          })}
        </div>
      </React.Fragment>
    );
  }
}

export default Families;
