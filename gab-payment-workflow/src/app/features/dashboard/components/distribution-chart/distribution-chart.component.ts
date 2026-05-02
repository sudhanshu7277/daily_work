import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-distribution-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  template: `
    <div class="card shadow-sm border-0 h-100">
      <div class="card-body text-center">
        <h6 class="text-muted fw-bold mb-3 text-start">{{ title }}</h6>
        <highcharts-chart 
          [Highcharts]="Highcharts"
          [options]="chartOptions"
          style="width: 100%; height: 220px; display: block;">
        </highcharts-chart>
      </div>
    </div>
  `
})
export class DistributionChartComponent implements OnChanges {
  @Input() title: string = '';
  @Input() data: { name: string, y: number, color?: string }[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data.length > 0) {
      this.initChart();
    }
  }

  private initChart() {
    this.chartOptions = {
      chart: { type: 'pie', backgroundColor: 'transparent' },
      title: { text: '' },
      credits: { enabled: false },
      tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
      plotOptions: {
        pie: {
          innerSize: '60%', // Creates the Donut effect
          dataLabels: { enabled: false },
          showInLegend: true
        }
      },
      series: [{
        type: 'pie',
        name: 'Share',
        data: this.data
      }]
    };
  }
}