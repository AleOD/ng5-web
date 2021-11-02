import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { GraphqlProductsService} from '../graphql.products.service';
import { Subscription } from 'rxjs';
import { GraphqlUsersService} from '../graphql.users.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  itemCount: number = 0;
  btnText: string = "add an item";
  goalText: string = ""
  user: string = ""
  pass: string = ""
  token: string = ""

  goals = [];

  loading: boolean;
  private querySubscription: Subscription;


  constructor(private _data: DataService, 
              private graphqlProductsService: GraphqlProductsService,
              private graphqlUsersService : GraphqlUsersService) { }

  ngOnInit(): void {
    this.itemCount = this.goals.length;
    this.getLinks();
  }

  getLinks() {
    this.querySubscription = this.graphqlProductsService.links("-")
    .valueChanges
    .subscribe(({ data, loading }) => {
      this.loading = loading;
      this.goals = JSON.parse(JSON.stringify(data)).links;
      this.itemCount = this.goals.length;
      console.log(JSON.stringify(this.goals))
    });
  }

  loginUser() {

    alert(this.user + " - " + this.pass);
    this.graphqlUsersService.tokenAuth(this.user, this.pass)
    .subscribe(({ data }) => {
       console.log('logged: ', JSON.stringify(data));
       
      this.token =  JSON.parse(JSON.stringify(data)).tokenAuth.token;
      localStorage.setItem('token', this.token);
    }, (error) => {
       console.log('there was an error sending the query', error);
    });
  
  }  

  addItem() {
    if (localStorage.getItem('token')) {
      // var mytoken = this.token;
      var mytoken = localStorage.getItem('token');
      //this.storageService.getSession("token");
      alert(this.goalText);
  
      this.graphqlProductsService.createLink(mytoken, "https://www.github.com", this.goalText)
      .subscribe(({ data }) => {
         console.log('link created :  ', data);
      }, (error) => {
         console.log('there was an error sending the query', error);
      });
  
      this.goalText = "";
      this.itemCount = this.goals.length;
      this._data.changeGoal(this.goals);
      this.getLinks();
    } else {
      alert('There is no auth token saved. Please login.');
    }
  }

  removeItem(i) {
    this.goals.splice(i,1);
    this._data.changeGoal(this.goals);
  }
}
