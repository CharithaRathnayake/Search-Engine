import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @Output() resultEvent: EventEmitter<any> = new EventEmitter();
  aggregations!: any;
  hits!: [];

  query!: string;
  searched: boolean = false;

  constructor(private searchService: SearchService) { }

  ngOnInit() {
    
  }

  search() {
    this.searchService.search(this.query).subscribe((result: any) => {
      this.resultEvent.emit(result.hits);
      this.aggregations = result.aggs;
      this.hits = result.hits;
      this.searched = true;
      // console.log(result)
    });
  }

  clear() {
    this.query = '';
    this.resultEvent.emit([]);
    this.searched = false;
  }

  filterByLyricist(key: any) {
    const newArr: any[] = [];
    this.hits.forEach((hit:any) => {
      if (hit._source.lyricist) {
        
          if (hit._source.lyricist === key) {
            // console.log(hit._source.title)
            newArr.push(hit);
          }
        
      }
    });
    this.resultEvent.emit(newArr);
  }

  filterByYear(key: any) {
    const newArr: any[] = [];
    this.hits.forEach((hit:any) => {
      if (hit._source.year) {
        
          if (hit._source.year === key) {
            newArr.push(hit);
          }
        
      }
    });
    //console.log(newArr)
    this.resultEvent.emit(newArr);
  }

  filterByAlbum(key: any) {
    const newArr: any[] = [];
    this.hits.forEach((hit:any) => {
      if (hit._source.album) {
        
          if (hit._source.album=== key) {
            newArr.push(hit);
          }
       
      }
    });
    this.resultEvent.emit(newArr);
  }

  // filterByGenre(key: any) {
  //   const newArr: any[] = [];
  //   this.hits.forEach((hit:any) => {
  //     if (hit._source.genre) {
  //       hit._source.genre.forEach((genre: any) => {
  //         if (genre === key) {
  //           newArr.push(hit);
  //         }
  //       });
  //     }
  //   });
  //   this.resultEvent.emit(newArr);
  // }

  // filter(key, count) {
  //   this.query = key + ' ' + this.query + ' ' + count;
  //   this.search();
  // }

}
